import assert from 'node:assert/strict'
import { mergeProgress, normalizeProgress } from './merge.js'
import { CURRENT_SCHEMA_VERSION } from './progress-schema.js'

const empty = { schemaVersion: CURRENT_SCHEMA_VERSION, lessons: [], questions: [], wrongs: {}, cards: {}, activity: [], preferences: {}, resume: null }
assert.deepEqual(normalizeProgress(), empty)
assert.deepEqual(normalizeProgress(null), empty)
assert.deepEqual(mergeProgress({ lessons: ['types'] }, null).lessons, ['types'])

const merged = mergeProgress(
  {
    lessons: ['types'],
    questions: ['types-1'],
    wrongs: { 'types-2': 1 },
    cards: { 'types-1': { reps: 1, due: '2026-08-12' } },
  },
  {
    lessons: ['states'],
    questions: ['states-1'],
    wrongs: { 'types-2': 2 },
    cards: {
      'types-1': { reps: 2, due: '2026-08-14' },
      'states-1': { reps: 1, due: '2026-08-12' },
    },
  },
)

assert.deepEqual(merged.lessons, ['types', 'states'])
assert.deepEqual(merged.questions, ['types-1', 'states-1'])
assert.equal(merged.wrongs['types-2'], 2)
assert.equal(merged.cards['types-1'].reps, 2)
assert.equal(merged.cards['states-1'].reps, 1)

const activityMerged = mergeProgress(
  { activity: [{ id: 'a1', at: '2026-08-10T10:00:00Z', questionId: 'types-1', correct: true }] },
  { activity: [{ id: 'a1', at: '2026-08-10T10:00:00Z', questionId: 'types-1', correct: true }, { id: 'a2', at: '2026-08-11T10:00:00Z', questionId: 'states-1', correct: false }] },
)
assert.deepEqual(activityMerged.activity.map(event => event.id), ['a1', 'a2'])

const preferenceMerged = mergeProgress(
  { preferences: { dailyGoal: 5, updatedAt: '2026-08-10T10:00:00Z' } },
  { preferences: { dailyGoal: 15, updatedAt: '2026-08-11T10:00:00Z' } },
)
assert.equal(preferenceMerged.preferences.dailyGoal, 15)

// Un échec récent ne perd pas contre une réussite plus ancienne mieux dotée en reps,
// et l'erreur correspondante reste à revoir.
const relapse = mergeProgress(
  { questions: ['types-1'], wrongs: { 'types-1': 1 }, cards: { 'types-1': { reps: 0, interval: 0, ease: 2.5, due: '2026-08-11', at: '2026-08-11T09:00:00.000Z' } } },
  { questions: ['types-1'], wrongs: {}, cards: { 'types-1': { reps: 4, interval: 21, ease: 2.7, due: '2026-09-01', at: '2026-07-20T09:00:00.000Z' } } },
)
assert.equal(relapse.cards['types-1'].reps, 0)
assert.equal(relapse.cards['types-1'].due, '2026-08-11')
assert.equal(relapse.wrongs['types-1'], 1)

// À l'inverse, une réussite plus récente que l'erreur solde bien l'erreur.
const recovered = mergeProgress(
  { questions: ['types-1'], wrongs: { 'types-1': 1 }, cards: { 'types-1': { reps: 0, interval: 0, ease: 2.5, due: '2026-08-11', at: '2026-08-11T09:00:00.000Z' } } },
  { questions: ['types-1'], wrongs: {}, cards: { 'types-1': { reps: 1, interval: 1, ease: 2.55, due: '2026-08-13', at: '2026-08-12T09:00:00.000Z' } } },
)
assert.equal(recovered.cards['types-1'].reps, 1)
assert.equal(recovered.wrongs['types-1'], undefined)

// Une carte horodatée est plus fiable qu'une carte ancienne sans horodatage.
const mixed = mergeProgress(
  { cards: { 'types-1': { reps: 0, due: '2026-08-11', at: '2026-08-11T09:00:00.000Z' } } },
  { cards: { 'types-1': { reps: 3, due: '2026-08-30' } } },
)
assert.equal(mixed.cards['types-1'].reps, 0)

// Une erreur sans carte associée reste à revoir.
assert.equal(mergeProgress({ wrongs: { 'types-9': 2 } }, {}).wrongs['types-9'], 2)

// La fusion conserve la version de format la plus élevée des deux côtés.
assert.equal(mergeProgress({}, {}).schemaVersion, CURRENT_SCHEMA_VERSION)
assert.equal(mergeProgress({}, { schemaVersion: CURRENT_SCHEMA_VERSION + 1 }).schemaVersion, CURRENT_SCHEMA_VERSION + 1)

// Le point de reprise le plus récent gagne.
const resumeMerged = mergeProgress(
  { resume: { lessonId: 'types', index: 2, at: '2026-08-10T10:00:00Z' } },
  { resume: { lessonId: 'states', index: 5, at: '2026-08-11T10:00:00Z' } },
)
assert.equal(resumeMerged.resume.lessonId, 'states')
assert.equal(mergeProgress({ resume: { lessonId: 'types', index: 2, at: '2026-08-10T10:00:00Z' } }, {}).resume.lessonId, 'types')
assert.equal(mergeProgress({}, {}).resume, null)

console.log('Merge tests passed')
