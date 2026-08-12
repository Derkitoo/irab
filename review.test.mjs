import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { curriculum } from './curriculum.js'
import { buildGlossary } from './glossary.js'
import { secondExplanation } from './explanations.js'
import { topicOf } from './question-topics.js'
import { FLAGS, LESSON_FLAGS } from './tools/review-flags.js'

const dossier = readFileSync(new URL('./revue.html', import.meta.url), 'utf8')
const lessons = curriculum.flatMap(module => module.lessons)
const written = lessons.flatMap(lesson => lesson.questions.filter(question => question.type !== 'builder' && !question.id.endsWith('-c')))
const glossary = buildGlossary(curriculum)

// Le dossier doit couvrir tout ce qui attend validation, sans exception : c'est
// sa seule raison d'être.
for (const lesson of lessons) {
  assert.ok(dossier.includes(`<code>${lesson.id}</code>`), `leçon absente du dossier : ${lesson.id}`)
  assert.ok(dossier.includes(lesson.rule.slice(0, 40).replace(/&/g, '&amp;')), `règle absente : ${lesson.id}`)
}
for (const question of written) {
  assert.ok(dossier.includes(`<code>${question.id}</code>`), `exercice absent du dossier : ${question.id}`)
  const second = secondExplanation(question.id)
  assert.ok(second, `${question.id} sans seconde explication`)
  assert.ok(dossier.includes(second.again.slice(0, 40)), `seconde explication absente : ${question.id}`)
}
for (const term of glossary) {
  assert.ok(dossier.includes(term.def.slice(0, 40)), `définition absente du dossier : ${term.tr}`)
}

// Chaque élément porte un repère stable, pour qu'on puisse le citer en réponse.
assert.ok(dossier.includes(`id="L-${String(lessons.length).padStart(2, '0')}"`), 'dernière leçon sans repère')
assert.ok(dossier.includes(`id="E-${String(written.length).padStart(2, '0')}"`), 'dernier exercice sans repère')
assert.ok(dossier.includes(`id="G-${String(glossary.length).padStart(2, '0')}"`), 'dernier terme sans repère')

// La réponse attendue est désignée pour chaque exercice.
assert.equal((dossier.match(/← réponse attendue/g) ?? []).length, written.length)

// L'arabe est balisé pour être lu et imprimé correctement.
assert.ok((dossier.match(/lang="ar" dir="rtl"/g) ?? []).length > 200)

// Aucun repère ⚑ ne doit pointer vers un contenu disparu.
const questionIds = new Set(written.map(question => question.id))
const lessonIds = new Set(lessons.map(lesson => lesson.id))
const deadQuestionFlags = Object.keys(FLAGS).filter(id => !questionIds.has(id))
const deadLessonFlags = Object.keys(LESSON_FLAGS).filter(id => !lessonIds.has(id))
assert.deepEqual(deadQuestionFlags, [], `repères d’exercice sans cible : ${deadQuestionFlags.join(', ')}`)
assert.deepEqual(deadLessonFlags, [], `repères de leçon sans cible : ${deadLessonFlags.join(', ')}`)
assert.equal((dossier.match(/class="flag"/g) ?? []).length, Object.keys(FLAGS).length + Object.keys(LESSON_FLAGS).length)

// Les exercices que j'ai ajoutés et le classement en catégories sont signalés.
for (const id of ['acc-3', 'plural-3']) {
  assert.ok(Object.hasOwn(FLAGS, id), `${id} a été écrit pour ce projet et doit être signalé`)
}
for (const question of written) {
  assert.ok(topicOf(question.id), `${question.id} sans catégorie : la section 5 serait incomplète`)
}

// Une zone d'annotation par élément, plus celle du classement.
assert.equal((dossier.match(/class="annotate"/g) ?? []).length, lessons.length + written.length + glossary.length + 1)

console.log('Review dossier tests passed')
