function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

export function createCoach(progress = {}, curriculum = [], reviewIds = [], now = new Date()) {
  const activity = Array.isArray(progress.activity) ? progress.activity : []
  const today = dateKey(now)
  const attemptsToday = activity.filter(event => dateKey(event?.at) === today).length
  const configuredGoal = Number(progress.preferences?.dailyGoal)
  const goal = [5, 10, 15].includes(configuredGoal) ? configuredGoal : 5
  const completedLessons = new Set(Array.isArray(progress.lessons) ? progress.lessons : [])
  const masteredQuestions = new Set(Array.isArray(progress.questions) ? progress.questions : [])

  if (reviewIds.length) {
    return {
      daily: { attempts: attemptsToday, goal, remaining: Math.max(0, goal - attemptsToday), percent: Math.min(100, Math.round(attemptsToday / goal * 100)) },
      recommendation: { type: 'review', title: 'Révision ciblée', reason: `${reviewIds.length} exercice${reviewIds.length > 1 ? 's' : ''} à consolider avant de poursuivre.` },
    }
  }

  const modules = curriculum.map((module, index) => {
    const questions = (module.lessons ?? []).flatMap(lesson => lesson.questions ?? [])
    const events = activity.filter(event => questions.some(question => question.id === event.questionId))
    const accuracy = events.length ? events.filter(event => event.correct).length / events.length : 1
    const mastery = questions.length ? questions.filter(question => masteredQuestions.has(question.id)).length / questions.length : 0
    return { module, index, events: events.length, accuracy, mastery }
  })
  const weak = modules
    .filter(item => item.events >= 2 && item.accuracy < 0.7 && item.mastery < 1)
    .sort((left, right) => left.accuracy - right.accuracy || left.index - right.index)[0]
  const targetModule = weak?.module
  const lesson = (targetModule?.lessons ?? []).find(item => !completedLessons.has(item.id))
    ?? curriculum.flatMap(module => module.lessons ?? []).find(item => !completedLessons.has(item.id))

  const recommendation = lesson
    ? { type: 'lesson', lessonId: lesson.id, title: lesson.title, reason: weak ? `Ce thème mérite un renforcement : ${weak.module.title}.` : 'La prochaine étape logique de ton parcours.' }
    : { type: 'complete', title: 'Parcours terminé', reason: 'Continue avec les révisions espacées pour consolider tes acquis.' }

  return {
    daily: { attempts: attemptsToday, goal, remaining: Math.max(0, goal - attemptsToday), percent: Math.min(100, Math.round(attemptsToday / goal * 100)) },
    recommendation,
  }
}
