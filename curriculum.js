import { advancedModules } from './content-advanced.js'
import { coreModules } from './content-core.js'

// Le programme complet : contenu d'un côté, moteur de l'autre.
// app.js n'a plus à connaître la forme d'une leçon, seulement ces trois exports.
export const curriculum = [...coreModules, ...advancedModules]

// Chaque question possède une seconde passe de consolidation avec un ordre différent.
// L'identifiant séparé permet au moteur SRS de mesurer la restitution, pas seulement la reconnaissance.
for (const module of curriculum) {
  for (const lesson of module.lessons) {
    const consolidation = lesson.questions.map(question => ({
      ...question,
      id: `${question.id}-c`,
      prompt: `Consolidation · ${question.prompt}`,
      choices: [...question.choices.slice(1), question.choices[0]],
      explanation: `À retenir : ${question.explanation}`,
    }))
    const source = lesson.questions.find(question => question.analysis) ?? lesson.questions[0]
    const builderAnalysis = source?.analysis || lesson.analysis
    const tokens = builderAnalysis?.trim().split(/\s+/) ?? []
    const builder = tokens.length > 2 ? [{
      id: `${lesson.id}-builder`,
      type: 'builder',
      prompt: 'Construis l’analyse dans le bon ordre.',
      arabic: source.arabic,
      tokens,
      order: [tokens.length - 1, ...tokens.slice(0, -1).map((_, index) => index)],
      answer: tokens.join(' '),
      explanation: 'L’analyse suit l’ordre : fonction, état grammatical, puis marque et justification.',
      analysis: builderAnalysis,
    }] : []
    lesson.questions = [...lesson.questions, ...consolidation, ...builder]
  }
}

export const allLessons = curriculum.flatMap(module => module.lessons)
export const allQuestions = allLessons.flatMap(lesson => lesson.questions)
