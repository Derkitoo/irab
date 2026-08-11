import assert from 'node:assert/strict'
import { computeAnalytics } from './analytics.js'

const curriculum = [{ id: 'base', title: 'Fondations', lessons: [{ questions: [{ id: 'types-1', prompt: 'Question 1' }, { id: 'states-1', prompt: 'Question 2' }] }] }]
const progress = {
  questions: ['types-1', 'states-1'],
  // La maîtrise se lit sur les cartes : states-1 a été ratée en dernier.
  cards: { 'types-1': { reps: 1, due: '2026-08-12' }, 'states-1': { reps: 0, due: '2026-08-11' } },
  activity: [
    { id: 'a1', at: '2026-08-10T10:00:00.000Z', questionId: 'types-1', correct: true },
    { id: 'a2', at: '2026-08-10T11:00:00.000Z', questionId: 'states-1', correct: false },
    { id: 'a3', at: '2026-08-11T11:00:00.000Z', questionId: 'states-1', correct: false },
  ],
}
const stats = computeAnalytics(progress, curriculum, new Date('2026-08-11T12:00:00.000Z'))

assert.equal(stats.attempts, 3)
assert.equal(stats.accuracy, 33)
assert.equal(stats.streak, 2)
assert.equal(stats.days.at(-1).attempts, 1)
assert.equal(stats.modules[0].accuracy, 33)
assert.equal(stats.trouble[0].questionId, 'states-1')
assert.equal(computeAnalytics({}, curriculum).attempts, 0)

// La maîtrise vient des cartes, pas de la liste des réussites : une question
// ratée en dernier ne compte plus comme maîtrisée même si elle y figure.
assert.equal(stats.mastered, 1)
assert.equal(stats.modules[0].mastered, 1)
assert.equal(stats.modules[0].mastery, 50)

// Répartition par compétence.
const nature = stats.topics.find(topic => topic.id === 'nature')
const etat = stats.topics.find(topic => topic.id === 'etat')
assert.equal(nature.total, 1)
assert.equal(nature.mastered, 1)
assert.equal(nature.errors, 0)
assert.equal(etat.attempts, 2)
assert.equal(etat.errors, 2)
assert.equal(etat.accuracy, 0)
assert.equal(stats.topics.find(topic => topic.id === 'marque').total, 0)
assert.equal(stats.trouble[0].topic, 'etat')

// Les jours suivent le fuseau local : une tentative après minuit heure locale
// appartient au jour local, pas au jour UTC de la veille.
const afterMidnight = new Date(2026, 7, 13, 0, 30, 0)
const localStats = computeAnalytics(
  { activity: [{ id: 'b1', at: afterMidnight.toISOString(), questionId: 'types-1', correct: true }] },
  curriculum,
  new Date(2026, 7, 13, 0, 35, 0),
)
assert.equal(localStats.days.at(-1).attempts, 1, 'la tentative doit tomber sur le jour local courant')
assert.equal(localStats.streak, 1)

// Deux jours locaux consécutifs à cheval sur minuit comptent bien pour deux.
const streakStats = computeAnalytics(
  {
    activity: [
      { id: 'c1', at: new Date(2026, 7, 12, 23, 0, 0).toISOString(), questionId: 'types-1', correct: true },
      { id: 'c2', at: new Date(2026, 7, 13, 0, 30, 0).toISOString(), questionId: 'states-1', correct: true },
    ],
  },
  curriculum,
  new Date(2026, 7, 13, 1, 0, 0),
)
assert.equal(streakStats.streak, 2)

console.log('Analytics tests passed')
