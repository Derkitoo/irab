import assert from 'node:assert/strict'
import { QUICK_SESSION_SIZE, buildQuickSession } from './session.js'

const curriculum = [
  { id: 'words', lessons: [{ id: 'types', questions: [{ id: 'types-1' }, { id: 'types-2' }, { id: 'types-3' }] }] },
  { id: 'cases', lessons: [{ id: 'states', questions: [{ id: 'states-1' }, { id: 'states-2' }, { id: 'states-3' }] }, { id: 'marks', questions: [{ id: 'marks-1' }, { id: 'marks-2' }] }] },
  { id: 'nominal', lessons: [{ id: 'mub', questions: [{ id: 'mub-1' }, { id: 'mub-2' }] }] },
]

// Parcours neuf : la session suit simplement l'ordre du programme.
const fresh = buildQuickSession({}, curriculum, [])
assert.equal(fresh.questionIds.length, QUICK_SESSION_SIZE)
assert.deepEqual(fresh.questionIds.slice(0, 3), ['types-1', 'types-2', 'types-3'])
assert.equal(fresh.composition.due, 0)
assert.equal(fresh.composition.fresh, QUICK_SESSION_SIZE)

// Les révisions dues passent devant tout le reste.
const withDue = buildQuickSession({}, curriculum, ['mub-2', 'marks-1'])
assert.deepEqual(withDue.questionIds.slice(0, 2), ['mub-2', 'marks-1'])
assert.equal(withDue.composition.due, 2)

// Un thème fragile remonte avant la suite du parcours.
const weakOnState = {
  cards: { 'types-1': { reps: 1 }, 'types-2': { reps: 1 }, 'types-3': { reps: 1 } },
  activity: [
    { id: 'a1', questionId: 'states-1', correct: false },
    { id: 'a2', questionId: 'states-2', correct: false },
    { id: 'a3', questionId: 'states-3', correct: true },
  ],
}
const weak = buildQuickSession(weakOnState, curriculum, [])
assert.ok(weak.weakTopics.includes('etat'))
assert.deepEqual(weak.questionIds.slice(0, 3), ['states-1', 'states-2', 'states-3'])
assert.ok(weak.composition.weak >= 3)
// Les questions déjà maîtrisées ne sont pas reproposées comme nouveautés.
assert.equal(weak.questionIds.includes('types-1'), false)

// Un thème réussi n'est pas considéré comme fragile.
const solid = buildQuickSession({ activity: [
  { id: 'b1', questionId: 'states-1', correct: true },
  { id: 'b2', questionId: 'states-2', correct: true },
] }, curriculum, [])
assert.deepEqual(solid.weakTopics, [])

// Aucun doublon, et une progression complète rend une session vide.
assert.equal(new Set(withDue.questionIds).size, withDue.questionIds.length)
const everything = Object.fromEntries(curriculum.flatMap(module => module.lessons.flatMap(lesson => lesson.questions.map(question => [question.id, { reps: 2 }]))))
assert.deepEqual(buildQuickSession({ cards: everything }, curriculum, []).questionIds, [])

// Un identifiant dû qui n'existe plus dans le programme est ignoré.
assert.equal(buildQuickSession({}, curriculum, ['supprimee-1']).questionIds.includes('supprimee-1'), false)

// La taille est réglable et bornée par le nombre d'exercices disponibles.
assert.equal(buildQuickSession({}, curriculum, [], 3).questionIds.length, 3)

console.log('Session tests passed')
