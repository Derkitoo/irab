import assert from 'node:assert/strict'
import { computeAnalytics } from './analytics.js'

const curriculum = [{ id: 'base', title: 'Fondations', lessons: [{ questions: [{ id: 'q1', prompt: 'Question 1' }, { id: 'q2', prompt: 'Question 2' }] }] }]
const progress = {
  questions: ['q1'],
  activity: [
    { id: 'a1', at: '2026-08-10T10:00:00.000Z', questionId: 'q1', correct: true },
    { id: 'a2', at: '2026-08-10T11:00:00.000Z', questionId: 'q2', correct: false },
    { id: 'a3', at: '2026-08-11T11:00:00.000Z', questionId: 'q2', correct: false },
  ],
}
const stats = computeAnalytics(progress, curriculum, new Date('2026-08-11T12:00:00.000Z'))

assert.equal(stats.attempts, 3)
assert.equal(stats.accuracy, 33)
assert.equal(stats.streak, 2)
assert.equal(stats.days.at(-1).attempts, 1)
assert.equal(stats.modules[0].mastery, 50)
assert.equal(stats.modules[0].accuracy, 33)
assert.equal(stats.trouble[0].questionId, 'q2')
assert.equal(computeAnalytics({}, curriculum).attempts, 0)

console.log('Analytics tests passed')
