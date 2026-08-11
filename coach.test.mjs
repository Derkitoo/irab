import assert from 'node:assert/strict'
import { createCoach } from './coach.js'

const curriculum = [
  { id: 'base', title: 'Fondations', lessons: [{ id: 'l1', title: 'Leçon 1', questions: [{ id: 'q1' }, { id: 'q2' }] }] },
  { id: 'states', title: 'Les états', lessons: [{ id: 'l2', title: 'Leçon 2', questions: [{ id: 'q3' }] }] },
]
const now = new Date('2026-08-11T12:00:00Z')

const reviewCoach = createCoach({ preferences: { dailyGoal: 10 }, activity: [{ id: 'a', at: '2026-08-11T10:00:00Z' }] }, curriculum, ['q1'], now)
assert.equal(reviewCoach.daily.goal, 10)
assert.equal(reviewCoach.daily.attempts, 1)
assert.equal(reviewCoach.recommendation.type, 'review')

const weakCoach = createCoach({ activity: [
  { id: 'a1', at: '2026-08-11T10:00:00Z', questionId: 'q1', correct: false },
  { id: 'a2', at: '2026-08-11T11:00:00Z', questionId: 'q2', correct: false },
] }, curriculum, [], now)
assert.equal(weakCoach.recommendation.lessonId, 'l1')
assert.match(weakCoach.recommendation.reason, /renforcement/)

const nextCoach = createCoach({ lessons: ['l1'] }, curriculum, [], now)
assert.equal(nextCoach.recommendation.lessonId, 'l2')
assert.equal(nextCoach.daily.goal, 5)

// L'objectif du jour suit le fuseau local : une tentative faite après minuit
// heure locale compte pour le nouveau jour, pas pour la veille.
const localNow = new Date(2026, 7, 13, 0, 30, 0)
const localCoach = createCoach(
  { activity: [
    { id: 'y', at: new Date(2026, 7, 12, 23, 0, 0).toISOString() },
    { id: 'z', at: new Date(2026, 7, 13, 0, 15, 0).toISOString() },
  ] },
  curriculum,
  [],
  localNow,
)
assert.equal(localCoach.daily.attempts, 1)

// La maîtrise vient des cartes : une question ratée en dernier reste à traiter.
const masteryCoach = createCoach(
  { lessons: [], questions: ['q1', 'q2'], cards: { q1: { reps: 1 }, q2: { reps: 0 } } },
  curriculum,
  [],
  now,
)
assert.equal(masteryCoach.recommendation.lessonId, 'l1')

console.log('Coach tests passed')
