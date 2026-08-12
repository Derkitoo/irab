import assert from 'node:assert/strict'
import { allQuestions } from './curriculum.js'
import { explainedIds, secondExplanation } from './explanations.js'

const ARABIC = /[؀-ۿ]/
const written = allQuestions.filter(question => question.type !== 'builder' && !question.id.endsWith('-c'))

// Chaque exercice écrit doit avoir sa seconde explication : sans elle, un
// apprenant bloqué relirait indéfiniment la même phrase.
const missing = written.filter(question => !secondExplanation(question.id)).map(question => question.id)
assert.deepEqual(missing, [], `exercices sans seconde explication : ${missing.join(', ')}`)

// Et aucune entrée ne doit survivre à la suppression de son exercice.
const ids = new Set(written.map(question => question.id))
const orphans = explainedIds().filter(id => !ids.has(id))
assert.deepEqual(orphans, [], `secondes explications orphelines : ${orphans.join(', ')}`)

for (const question of written) {
  const entry = secondExplanation(question.id)
  assert.ok(entry.again.length > 60, `${question.id} : seconde explication trop courte`)
  // Une paraphrase ne débloque personne : le second angle doit être un autre texte.
  assert.notEqual(entry.again, question.explanation, `${question.id} : seconde explication identique à la première`)
  if (!entry.example) continue
  assert.match(entry.example.ar, ARABIC, `${question.id} : exemple sans arabe`)
  assert.doesNotMatch(entry.example.ar, /[A-Za-zÀ-ÿ]/, `${question.id} : l’exemple arabe contient du texte latin`)
  assert.match(entry.example.analysis, ARABIC, `${question.id} : analyse de l’exemple sans arabe`)
  assert.ok(entry.example.fr.length > 5, `${question.id} : traduction de l’exemple manquante`)
}

// La passe de consolidation hérite de la question d'origine.
assert.equal(secondExplanation('types-1-c'), secondExplanation('types-1'))
// Les constructions par blocs n'en ont pas : elles ne portent pas sur un point isolé.
assert.equal(secondExplanation('types-builder'), null)
assert.equal(secondExplanation('inconnue-9'), null)
assert.equal(secondExplanation(), null)

// Une bonne part des exercices gagne un exemple supplémentaire.
const withExample = written.filter(question => secondExplanation(question.id).example)
assert.ok(withExample.length >= 15, `trop peu d’exemples supplémentaires : ${withExample.length}`)

console.log('Explanation tests passed')
