import assert from 'node:assert/strict'
import { curriculum } from './curriculum.js'
import { STOP_AFTER_MISSES, buildDiagnostic, diagnosticRecord, isComplete, nextProbeIndex, placeLearner } from './diagnostic.js'

const diagnostic = buildDiagnostic(curriculum)

// Une sonde par module, dans l'ordre du parcours.
assert.equal(diagnostic.length, curriculum.length)
assert.deepEqual(diagnostic.map(probe => probe.moduleId), curriculum.map(module => module.id))
assert.deepEqual(diagnostic.map(probe => probe.moduleIndex), curriculum.map((_, index) => index))

for (const probe of diagnostic) {
  // Aucune sonde inventée : ce sont des exercices du parcours, jamais une
  // consolidation ni une construction par blocs.
  assert.ok(probe.question.id, `sonde sans exercice : ${probe.moduleId}`)
  assert.equal(probe.question.id.endsWith('-c'), false)
  assert.notEqual(probe.question.type, 'builder')
  assert.ok(probe.question.choices.length >= 2)
  assert.ok(probe.lessonId, `sonde sans leçon d’arrivée : ${probe.moduleId}`)
  assert.ok(curriculum.some(module => module.lessons.some(lesson => lesson.id === probe.lessonId)))
}

// Le diagnostic s'arrête après deux échecs consécutifs.
assert.equal(STOP_AFTER_MISSES, 2)
assert.equal(isComplete([], diagnostic), false)
assert.equal(isComplete([true, false], diagnostic), false)
assert.equal(isComplete([true, false, false], diagnostic), true)
assert.equal(isComplete([false, true, false], diagnostic), false)
assert.equal(nextProbeIndex([true, true], diagnostic), 2)
assert.equal(nextProbeIndex([true, false, false], diagnostic), null)
// Sans échec, il va jusqu'au bout puis s'arrête.
const allTrue = diagnostic.map(() => true)
assert.equal(nextProbeIndex(allTrue, diagnostic), null)
assert.equal(nextProbeIndex(allTrue.slice(0, -1), diagnostic), diagnostic.length - 1)

// Le premier module raté devient le point de départ.
const beginner = placeLearner([false, false], diagnostic)
assert.equal(beginner.moduleIndex, 0)
assert.equal(beginner.lessonId, curriculum[0].lessons[0].id)
assert.match(beginner.reason, /nature des mots/)

const intermediate = placeLearner([true, true, true, false, false], diagnostic)
assert.equal(intermediate.moduleIndex, 3)
assert.equal(intermediate.moduleId, curriculum[3].id)
assert.equal(intermediate.correct, 3)
assert.equal(intermediate.answered, 5)
assert.match(intermediate.reason, /Les 3 premiers modules te sont acquis/)

// Un seul module acquis se dit au singulier, sans chiffre.
const single = placeLearner([true, false, false], diagnostic).reason
assert.match(single, /Le premier module t’est acquis/)
assert.doesNotMatch(single, /1 premier/)

// Sans aucune erreur, le diagnostic renvoie vers la fin du parcours.
const expert = placeLearner(allTrue, diagnostic)
assert.equal(expert.allCorrect, true)
assert.equal(expert.moduleIndex, curriculum.length - 1)
assert.match(expert.reason, /révisions espacées/)

assert.equal(placeLearner([], []), null)
assert.equal(buildDiagnostic().length, 0)

// La trace enregistrée reste minimale : de quoi orienter le coach, rien de plus.
const record = diagnosticRecord(intermediate, new Date('2026-08-12T09:00:00.000Z'))
assert.deepEqual(record, {
  at: '2026-08-12T09:00:00.000Z',
  moduleId: curriculum[3].id,
  lessonId: curriculum[3].lessons[0].id,
  correct: 3,
  answered: 5,
})
assert.equal(diagnosticRecord(null), null)

console.log('Diagnostic tests passed')
