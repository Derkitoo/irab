import assert from 'node:assert/strict'
import { mergeProgress, normalizeProgress } from './merge.js'

assert.deepEqual(normalizeProgress(), { lessons: [], questions: [], wrongs: {}, cards: {}, activity: [] })
assert.deepEqual(normalizeProgress(null), { lessons: [], questions: [], wrongs: {}, cards: {}, activity: [] })
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

console.log('Merge tests passed')
