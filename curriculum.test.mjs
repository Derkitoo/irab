import assert from 'node:assert/strict'
import { allLessons, allQuestions, curriculum } from './curriculum.js'
import { topicOf } from './question-topics.js'

const ARABIC = /[؀-ۿ]/

assert.equal(curriculum.length, 12)
assert.equal(allLessons.length, 25)
assert.equal(allQuestions.length, 129)

// Les identifiants sont uniques : la progression et les cartes s'y indexent.
const lessonIds = allLessons.map(lesson => lesson.id)
assert.equal(new Set(lessonIds).size, lessonIds.length, 'identifiants de leçon dupliqués')
const questionIds = allQuestions.map(question => question.id)
assert.equal(new Set(questionIds).size, questionIds.length, 'identifiants d’exercice dupliqués')

for (const module of curriculum) {
  assert.ok(module.id && module.title && module.description, `module incomplet : ${module.id}`)
  assert.match(module.ar, ARABIC, `titre arabe manquant : ${module.id}`)
  assert.ok(module.lessons.length > 0)
}

for (const lesson of allLessons) {
  for (const field of ['title', 'summary', 'rule', 'translation']) {
    assert.ok(lesson[field]?.length > 0, `${lesson.id} : ${field} vide`)
  }
  for (const field of ['ar', 'example', 'analysis']) {
    assert.match(lesson[field], ARABIC, `${lesson.id} : ${field} sans arabe`)
    // Ces champs sont rendus dans un panneau droite-à-gauche : du texte latin
    // s'y afficherait à l'envers.
    assert.doesNotMatch(lesson[field], /[A-Za-zÀ-ÿ]/, `${lesson.id} : ${field} contient du texte latin`)
  }
  assert.ok(lesson.questions.length >= 4, `${lesson.id} : trop peu d’exercices`)
}

for (const question of allQuestions) {
  assert.ok(question.prompt?.length > 0, `${question.id} : énoncé vide`)
  assert.match(question.arabic, ARABIC, `${question.id} : phrase arabe manquante`)
  assert.ok(question.explanation?.length > 0, `${question.id} : explication vide`)
  assert.ok(topicOf(question.id), `${question.id} : aucune catégorie de compétence`)

  if (question.type === 'builder') {
    assert.ok(question.tokens.length > 2, `${question.id} : trop peu de blocs`)
    assert.equal(question.answer, question.tokens.join(' '))
    assert.deepEqual([...question.order].sort((a, b) => a - b), question.tokens.map((_, index) => index), `${question.id} : ordre incomplet`)
    // Les blocs doivent être mélangés, sinon l'exercice se résout sans réfléchir.
    assert.notDeepEqual(question.order, question.tokens.map((_, index) => index), `${question.id} : blocs non mélangés`)
    continue
  }

  assert.ok(question.choices.length >= 2, `${question.id} : moins de deux propositions`)
  const values = question.choices.map(choice => choice[1])
  assert.equal(new Set(values).size, values.length, `${question.id} : valeurs de réponse dupliquées`)
  assert.ok(values.includes(question.answer), `${question.id} : la bonne réponse n’est pas proposée`)
  assert.ok(question.choices.every(choice => choice[0]?.length > 0), `${question.id} : libellé de proposition vide`)
}

// Chaque exercice écrit à la main engendre une passe de consolidation, et chaque
// leçon une construction par blocs.
const base = allQuestions.filter(question => !question.id.endsWith('-c') && question.type !== 'builder')
const consolidation = allQuestions.filter(question => question.id.endsWith('-c'))
const builders = allQuestions.filter(question => question.type === 'builder')
assert.equal(base.length, 52)
assert.equal(consolidation.length, 52)
assert.equal(builders.length, 25)
for (const question of base) {
  assert.ok(consolidation.some(item => item.id === `${question.id}-c`), `${question.id} : consolidation manquante`)
}

console.log('Curriculum tests passed')
