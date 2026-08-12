import assert from 'node:assert/strict'
import { curriculum } from './curriculum.js'
import { BADGES, badgeById, earnedBadges, newlyEarned } from './badges.js'

const day = (year, month, date) => new Date(year, month, date, 12, 0, 0).toISOString()
const has = (progress, id) => earnedBadges(progress, curriculum).includes(id)

// Six jalons, tous décrits et tous distincts.
assert.equal(BADGES.length, 6)
assert.equal(new Set(BADGES.map(badge => badge.id)).size, 6)
for (const badge of BADGES) {
  assert.ok(badge.label.length > 3, `${badge.id} : libellé manquant`)
  assert.ok(badge.detail.length > 30, `${badge.id} : description trop courte`)
  assert.ok(badge.hint.length > 10, `${badge.id} : indication manquante`)
  assert.equal(typeof badge.earned, 'function')
}

// Une progression vide n'en débloque aucun.
assert.deepEqual(earnedBadges({}, curriculum), [])
assert.deepEqual(earnedBadges(undefined, undefined), [])

// Première analyse complète : une construction par blocs réussie.
assert.equal(has({ questions: ['types-1'] }, 'first-analysis'), false)
assert.equal(has({ questions: ['types-builder'] }, 'first-analysis'), true)

// Erreur retournée : raté puis réussi. Réussir du premier coup ne suffit pas.
assert.equal(has({ questions: ['types-1'], activity: [{ id: 'a', at: day(2026, 7, 10), questionId: 'types-1', correct: true }] }, 'error-turned'), false)
assert.equal(has({ questions: ['types-1'], activity: [{ id: 'a', at: day(2026, 7, 10), questionId: 'types-1', correct: false }] }, 'error-turned'), true)
// Rater sans jamais y revenir ne débloque rien.
assert.equal(has({ questions: [], activity: [{ id: 'a', at: day(2026, 7, 10), questionId: 'types-1', correct: false }] }, 'error-turned'), false)

// Module bouclé : tous les exercices d'un module réussis au moins une fois.
const firstModule = curriculum[0]
const firstModuleIds = firstModule.lessons.flatMap(lesson => lesson.questions.map(question => question.id))
assert.equal(has({ questions: firstModuleIds.slice(0, -1) }, 'module-mastered'), false)
assert.equal(has({ questions: firstModuleIds }, 'module-mastered'), true)

// Semaine régulière : sept jours consécutifs.
const run = length => ({ activity: Array.from({ length }, (_, index) => ({ id: `r${index}`, at: day(2026, 7, 1 + index), questionId: 'types-1', correct: true })) })
assert.equal(has(run(6), 'regular-week'), false)
assert.equal(has(run(7), 'regular-week'), true)
// Plusieurs séances le même jour ne comptent qu'une fois.
assert.equal(has({ activity: Array.from({ length: 9 }, (_, index) => ({ id: `s${index}`, at: day(2026, 7, 3), questionId: 'types-1', correct: true })) }, 'regular-week'), false)
// Un jour manquant coupe la série, mais la plus longue série passée compte
// toujours : un jalon obtenu ne se reprend pas.
const brokenThenLong = { activity: [...run(7).activity, { id: 'x', at: day(2026, 8, 15), questionId: 'types-1', correct: true }] }
assert.equal(has(brokenThenLong, 'regular-week'), true)

// Retour tenu : une interruption de trois jours pleins, puis un retour.
const pause = gap => ({ activity: [
  { id: 'p1', at: day(2026, 7, 1), questionId: 'types-1', correct: true },
  { id: 'p2', at: day(2026, 7, 1 + gap), questionId: 'types-1', correct: true },
] })
assert.equal(has(pause(3), 'comeback'), false)
assert.equal(has(pause(4), 'comeback'), true)
assert.equal(has(pause(12), 'comeback'), true)

// Parcours terminé : les vingt-cinq leçons.
const allLessonIds = curriculum.flatMap(module => module.lessons.map(lesson => lesson.id))
assert.equal(has({ lessons: allLessonIds.slice(0, -1) }, 'course-complete'), false)
assert.equal(has({ lessons: allLessonIds }, 'course-complete'), true)

// Aucun jalon ne dépend de la maîtrise courante, qui est révocable : une carte
// remise à zéro ne doit rien retirer.
const mastered = { questions: firstModuleIds, cards: Object.fromEntries(firstModuleIds.map(id => [id, { reps: 0 }])) }
assert.equal(has(mastered, 'module-mastered'), true)

// Nouveautés d'une action à la suivante.
assert.deepEqual(newlyEarned(['a'], ['a', 'b']), ['b'])
assert.deepEqual(newlyEarned(['a', 'b'], ['a', 'b']), [])
assert.deepEqual(newlyEarned([], []), [])

assert.equal(badgeById('comeback').label, 'Retour tenu')
assert.equal(badgeById('inconnu'), null)

// L'ordre rendu suit celui des définitions, pas celui de l'obtention.
const everything = { questions: [...firstModuleIds, 'types-builder'], lessons: allLessonIds, activity: [...run(7).activity, { id: 'f', at: day(2026, 7, 20), questionId: firstModuleIds[0], correct: false }] }
assert.deepEqual(earnedBadges(everything, curriculum), BADGES.map(badge => badge.id))

console.log('Badge tests passed')
