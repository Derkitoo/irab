import assert from 'node:assert/strict'
import { createBackup, parseBackup } from './backup.js'
import { CURRENT_SCHEMA_VERSION } from './progress-schema.js'

const progress = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  lessons: ['types'],
  questions: ['types-1'],
  wrongs: {},
  cards: { 'types-1': { reps: 1, interval: 1, ease: 2.55, due: '2026-08-12' } },
  activity: [{ id: 'a1', at: '2026-08-11T11:00:00Z', questionId: 'types-1', correct: true }],
  preferences: { dailyGoal: 10, updatedAt: '2026-08-11T11:00:00Z' },
  resume: null,
}

const payload = createBackup(progress, new Date('2026-08-11T12:00:00Z'))
assert.equal(payload.app, 'irab-fr')
assert.equal(payload.version, 1)
assert.deepEqual(parseBackup(JSON.stringify(payload)), progress)

// Une sauvegarde d'origine, sans journal ni version de format, reste restaurable.
const legacyProgress = { lessons: ['types'], questions: [], wrongs: {}, cards: {} }
const restoredLegacy = parseBackup(JSON.stringify({ app: 'irab-fr', version: 1, progress: legacyProgress }))
assert.deepEqual(restoredLegacy.activity, [])
assert.deepEqual(restoredLegacy.preferences, {})
assert.equal(restoredLegacy.schemaVersion, CURRENT_SCHEMA_VERSION)

// Une sauvegarde écrite par une version plus récente garde ses champs inconnus.
const futureProgress = { schemaVersion: CURRENT_SCHEMA_VERSION + 1, lessons: [], questions: [], badges: ['semaine-reguliere'] }
const restoredFuture = parseBackup(JSON.stringify({ app: 'irab-fr', version: 1, progress: futureProgress }))
assert.equal(restoredFuture.schemaVersion, CURRENT_SCHEMA_VERSION + 1)
assert.deepEqual(restoredFuture.badges, ['semaine-reguliere'])

assert.throws(() => parseBackup('{}'))
assert.throws(() => parseBackup('{broken'))
assert.throws(() => parseBackup(JSON.stringify({ app: 'another-app', version: 1, progress })))

console.log('Backup tests passed')
