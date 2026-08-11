import assert from 'node:assert/strict'
import { CURRENT_SCHEMA_VERSION } from './progress-schema.js'
import { scheduleCard } from './srs.js'
import { publish, synchronize } from './sync.js'

// Faux Supabase : authentification, isolation par utilisateur (équivalent RLS)
// et pannes déclenchables. Il remplace un vrai navigateur pour vérifier le
// parcours inscription → première synchronisation vide → deux appareils.
function createBackend({ confirmationRequired = false } = {}) {
  const users = new Map()
  const rows = new Map()
  let failure = null
  let identifier = 0

  function authorize(session, userId) {
    if (!session) throw Object.assign(new Error('JWT expired'), { status: 401 })
    if (session.user.id !== userId) throw Object.assign(new Error('new row violates row-level security policy'), { code: '42501' })
    if (failure) throw failure
  }

  return {
    calls: { load: 0, save: 0 },
    breakWith(error) { failure = error },
    repair() { failure = null },
    remoteRow(userId) { return rows.get(userId) ?? null },
    signUp(email, password) {
      if (users.has(email)) throw Object.assign(new Error('User already registered'), { status: 422 })
      if (password.length < 8) throw new Error('Password should be at least 8 characters')
      identifier += 1
      const user = { id: `user-${identifier}`, email, password }
      users.set(email, user)
      return confirmationRequired ? null : { user }
    },
    signIn(email, password) {
      const user = users.get(email)
      if (!user || user.password !== password) throw Object.assign(new Error('Invalid login credentials'), { status: 400 })
      return { user }
    },
    load(session, userId) {
      authorize(session, userId)
      this.calls.load += 1
      // Une première connexion ne possède aucune ligne : le cloud rend null.
      return structuredClone(rows.get(userId) ?? null)
    },
    save(session, userId, progress) {
      authorize(session, userId)
      this.calls.save += 1
      rows.set(userId, structuredClone(progress))
    },
  }
}

// Un appareil : sa copie locale, sa session et les mêmes appels que l'application.
function createDevice(backend, name) {
  return {
    name,
    session: null,
    online: true,
    local: { lessons: [], questions: [], wrongs: {}, cards: {}, activity: [], preferences: {} },
    signUp(email, password) { this.session = backend.signUp(email, password); return this.session },
    signIn(email, password) { this.session = backend.signIn(email, password); return this.session },
    answer(questionId, correct, at) {
      this.local.activity = [...this.local.activity, { id: `${name}-${questionId}-${at}`, at, questionId, correct }]
      this.local.cards = { ...this.local.cards, [questionId]: scheduleCard(this.local.cards[questionId], correct, new Date(at)) }
      if (correct) this.local.questions = [...new Set([...this.local.questions, questionId])]
      else this.local.wrongs = { ...this.local.wrongs, [questionId]: (this.local.wrongs[questionId] ?? 0) + 1 }
    },
    finish(lessonId) { this.local.lessons = [...new Set([...this.local.lessons, lessonId])] },
    setGoal(dailyGoal, updatedAt) { this.local.preferences = { dailyGoal, updatedAt } },
    async sync() {
      const result = await synchronize({
        userId: this.session.user.id,
        local: this.local,
        loadRemote: userId => backend.load(this.session, userId),
        saveRemote: (userId, progress) => backend.save(this.session, userId, progress),
        online: this.online,
      })
      if (result.status === 'synced') this.local = result.progress
      return result
    },
  }
}

// 1. Création de compte et première synchronisation sur une progression distante vide.
const backend = createBackend()
const phone = createDevice(backend, 'phone')
phone.signUp('etudiant@exemple.fr', 'motdepasse1')
phone.answer('types-1', true, '2026-08-10T09:00:00Z')
phone.finish('types')
phone.setGoal(10, '2026-08-10T09:05:00Z')

const first = await phone.sync()
assert.equal(first.status, 'synced')
assert.equal(first.error, null)
assert.equal(first.progress.schemaVersion, CURRENT_SCHEMA_VERSION)
assert.deepEqual(first.progress.lessons, ['types'])
assert.deepEqual(backend.remoteRow('user-1').questions, ['types-1'])

// 2. Un second appareil récupère la progression du premier sans rien perdre.
const laptop = createDevice(backend, 'laptop')
laptop.signIn('etudiant@exemple.fr', 'motdepasse1')
const pulled = await laptop.sync()
assert.equal(pulled.status, 'synced')
assert.deepEqual(pulled.progress.lessons, ['types'])
assert.deepEqual(pulled.progress.questions, ['types-1'])
assert.equal(pulled.progress.preferences.dailyGoal, 10)
assert.equal(pulled.progress.activity.length, 1)

// 3. Modification sur le second appareil, puis retour sur le premier : fusion sans doublon.
laptop.answer('states-1', false, '2026-08-11T08:00:00Z')
laptop.finish('built')
laptop.setGoal(15, '2026-08-11T08:10:00Z')
await laptop.sync()

phone.answer('marks-1', true, '2026-08-11T09:00:00Z')
const reunited = await phone.sync()
assert.deepEqual(reunited.progress.lessons.sort(), ['built', 'types'])
assert.deepEqual(reunited.progress.questions.sort(), ['marks-1', 'types-1'])
assert.equal(reunited.progress.wrongs['states-1'], 1)
assert.equal(reunited.progress.activity.length, 3)
assert.equal(new Set(reunited.progress.activity.map(event => event.id)).size, 3)
// Le choix d'objectif le plus récent gagne.
assert.equal(reunited.progress.preferences.dailyGoal, 15)

// 4. Une synchronisation répétée est idempotente.
const before = JSON.stringify(reunited.progress)
const again = await phone.sync()
assert.equal(JSON.stringify(again.progress), before)

// 5. Un exercice réussi ailleurs sort de la liste des erreurs à revoir.
laptop.answer('states-1', true, '2026-08-11T10:00:00Z')
await laptop.sync()
const cleared = await phone.sync()
assert.equal(cleared.progress.wrongs['states-1'], undefined)
assert.ok(cleared.progress.questions.includes('states-1'))

// 5 bis. Un échec sur une question maîtrisée de longue date survit à la synchronisation.
phone.local.cards = { ...phone.local.cards, 'types-1': { reps: 4, interval: 21, ease: 2.7, due: '2026-09-01', at: '2026-07-20T09:00:00.000Z' } }
await phone.sync()
laptop.local = (await laptop.sync()).progress
laptop.answer('types-1', false, '2026-08-12T08:00:00Z')
await laptop.sync()
const relapse = await phone.sync()
assert.equal(relapse.progress.cards['types-1'].reps, 0, 'l’échec le plus récent doit gagner')
assert.equal(relapse.progress.wrongs['types-1'], 1, 'l’erreur doit rester à revoir')
assert.equal(relapse.progress.cards['types-1'].due, '2026-08-12')

// 6. Panne réseau : message explicite, progression locale intacte, reprise après réparation.
backend.breakWith(new TypeError('Failed to fetch'))
phone.answer('marks-2', true, '2026-08-11T11:00:00Z')
const failed = await phone.sync()
assert.equal(failed.status, 'error')
assert.equal(failed.error.retryable, true)
assert.match(failed.error.message, /injoignable/i)
assert.ok(phone.local.questions.includes('marks-2'))
assert.equal(backend.remoteRow('user-1').questions.includes('marks-2'), false)

backend.repair()
const recovered = await phone.sync()
assert.equal(recovered.status, 'synced')
assert.ok(backend.remoteRow('user-1').questions.includes('marks-2'))

// 7. Hors ligne : le message le dit, sans faire croire à une perte de données.
phone.online = false
backend.breakWith(new TypeError('Failed to fetch'))
const offline = await phone.sync()
assert.equal(offline.status, 'error')
assert.match(offline.error.message, /hors ligne/i)
backend.repair()
phone.online = true

// 8. Un autre compte ne peut pas lire ni écrire la ligne du premier.
const intruder = createDevice(backend, 'intruder')
intruder.signUp('autre@exemple.fr', 'motdepasse2')
const stolen = await synchronize({
  userId: 'user-1',
  local: { lessons: ['hack'] },
  loadRemote: userId => backend.load(intruder.session, userId),
  saveRemote: (userId, progress) => backend.save(intruder.session, userId, progress),
})
assert.equal(stolen.status, 'error')
assert.equal(backend.remoteRow('user-1').lessons.includes('hack'), false)

// 9. Une progression distante écrite par une version plus récente n'est jamais écrasée.
const futureBackend = createBackend()
const futureDevice = createDevice(futureBackend, 'ancienne-version')
futureDevice.signUp('futur@exemple.fr', 'motdepasse3')
futureBackend.save(futureDevice.session, 'user-1', { schemaVersion: CURRENT_SCHEMA_VERSION + 1, lessons: ['types'], badges: ['module-maitrise'] })
futureDevice.finish('states')
const blocked = await futureDevice.sync()
assert.equal(blocked.status, 'blocked')
assert.equal(blocked.error.retryable, false)
assert.match(blocked.error.message, /version plus récente/i)
assert.deepEqual(futureBackend.remoteRow('user-1').badges, ['module-maitrise'])
assert.equal(futureBackend.remoteRow('user-1').lessons.includes('states'), false)

// 10. Une inscription en attente de confirmation ne donne pas de session.
const confirming = createBackend({ confirmationRequired: true })
const pending = createDevice(confirming, 'attente')
assert.equal(pending.signUp('confirme@exemple.fr', 'motdepasse4'), null)

// 11. Un envoi direct remonte aussi une erreur lisible.
const pushBackend = createBackend()
const pushDevice = createDevice(pushBackend, 'push')
pushDevice.signUp('push@exemple.fr', 'motdepasse5')
pushBackend.breakWith(Object.assign(new Error('Service Unavailable'), { status: 503 }))
const pushed = await publish({
  userId: pushDevice.session.user.id,
  progress: pushDevice.local,
  saveRemote: (userId, progress) => pushBackend.save(pushDevice.session, userId, progress),
})
assert.equal(pushed.status, 'error')
assert.match(pushed.error.message, /indisponible/i)

console.log('Sync tests passed')
