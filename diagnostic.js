// Test de positionnement : une sonde par module, dans l'ordre du parcours.
//
// Deux choix assumés.
//
// Les sondes sont des exercices existants, pas des questions écrites pour
// l'occasion : rien de neuf à faire relire, et l'apprenant est jugé sur le
// contenu qu'il va réellement travailler.
//
// Les réponses au diagnostic n'alimentent ni le journal d'activité ni la
// répétition espacée. Sinon un débutant sortirait du positionnement avec une
// dizaine de cartes en retard sur des leçons qu'il n'a jamais ouvertes.

export const STOP_AFTER_MISSES = 2

export function buildDiagnostic(curriculum = []) {
  return curriculum
    .map((module, moduleIndex) => {
      const lessons = module.lessons ?? []
      const question = lessons
        .flatMap(lesson => (lesson.questions ?? []).map(item => ({ lesson, item })))
        .find(({ item }) => item.type !== 'builder' && !item.id.endsWith('-c'))
      if (!question) return null
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        moduleIndex,
        lessonId: lessons[0]?.id ?? question.lesson.id,
        question: question.item,
      }
    })
    .filter(Boolean)
}

// Deux échecs de suite suffisent : le niveau est trouvé, insister n'apprend
// plus rien et décourage.
export function isComplete(answers = [], diagnostic = []) {
  if (answers.length >= diagnostic.length) return true
  const tail = answers.slice(-STOP_AFTER_MISSES)
  return tail.length === STOP_AFTER_MISSES && tail.every(answer => answer === false)
}

export function nextProbeIndex(answers = [], diagnostic = []) {
  return isComplete(answers, diagnostic) ? null : answers.length
}

export function placeLearner(answers = [], diagnostic = []) {
  if (!diagnostic.length) return null
  const correct = answers.filter(Boolean).length
  const firstMiss = answers.indexOf(false)
  const allCorrect = firstMiss === -1

  // Le premier module raté est le bon point de départ : ce qui précède tient.
  const target = allCorrect ? diagnostic[diagnostic.length - 1] : diagnostic[firstMiss]

  return {
    moduleId: target.moduleId,
    moduleTitle: target.moduleTitle,
    moduleIndex: target.moduleIndex,
    lessonId: target.lessonId,
    correct,
    answered: answers.length,
    total: diagnostic.length,
    allCorrect,
    reason: allCorrect
      ? 'Tu as répondu juste partout. Prends la dernière étape du parcours, puis appuie-toi sur les révisions espacées.'
      : firstMiss === 0
        ? 'Le parcours commence au bon endroit pour toi : la nature des mots avant tout le reste.'
        : firstMiss === 1
          ? 'Le premier module t’est acquis. C’est ici que ça se joue.'
          : `Les ${firstMiss} premiers modules te sont acquis. C’est ici que ça se joue.`,
  }
}

export function diagnosticRecord(placement, now = new Date()) {
  if (!placement) return null
  return {
    at: now.toISOString(),
    moduleId: placement.moduleId,
    lessonId: placement.lessonId,
    correct: placement.correct,
    answered: placement.answered,
  }
}
