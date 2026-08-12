import { goalDayKey } from './day.js'
import { isMastered } from './mastery.js'

export function createCoach(progress = {}, curriculum = [], reviewIds = [], now = new Date()) {
  const activity = Array.isArray(progress.activity) ? progress.activity : []
  const resetHour = Number(progress.preferences?.resetHour)
  const hour = Number.isInteger(resetHour) && resetHour >= 0 && resetHour <= 23 ? resetHour : 0
  const today = goalDayKey(now, hour)
  const attemptsToday = activity.filter(event => goalDayKey(event?.at, hour) === today).length
  const configuredGoal = Number(progress.preferences?.dailyGoal)
  const goal = [5, 10, 15].includes(configuredGoal) ? configuredGoal : 5
  const completedLessons = new Set(Array.isArray(progress.lessons) ? progress.lessons : [])

  if (reviewIds.length) {
    return {
      daily: { attempts: attemptsToday, goal, resetHour: hour, remaining: Math.max(0, goal - attemptsToday), percent: Math.min(100, Math.round(attemptsToday / goal * 100)) },
      recommendation: { type: 'review', title: 'Révision ciblée', reason: `${reviewIds.length} exercice${reviewIds.length > 1 ? 's' : ''} à consolider avant de poursuivre.` },
    }
  }

  const modules = curriculum.map((module, index) => {
    const questions = (module.lessons ?? []).flatMap(lesson => lesson.questions ?? [])
    const events = activity.filter(event => questions.some(question => question.id === event.questionId))
    const accuracy = events.length ? events.filter(event => event.correct).length / events.length : 1
    const mastery = questions.length ? questions.filter(question => isMastered(progress, question.id)).length / questions.length : 0
    return { module, index, events: events.length, accuracy, mastery }
  })
  const weak = modules
    .filter(item => item.events >= 2 && item.accuracy < 0.7 && item.mastery < 1)
    .sort((left, right) => left.accuracy - right.accuracy || left.index - right.index)[0]
  const targetModule = weak?.module
  const everyLesson = curriculum.flatMap(module => module.lessons ?? [])
  // Tant qu'aucune leçon n'est terminée, le positionnement décide du départ :
  // imposer la leçon 1 à quelqu'un qui a démontré connaître les bases est le
  // meilleur moyen de le perdre.
  const placed = completedLessons.size === 0 && progress.diagnostic?.lessonId
    ? everyLesson.find(item => item.id === progress.diagnostic.lessonId)
    : null
  const lesson = placed
    ?? (targetModule?.lessons ?? []).find(item => !completedLessons.has(item.id))
    ?? everyLesson.find(item => !completedLessons.has(item.id))

  const recommendation = lesson
    ? { type: 'lesson', lessonId: lesson.id, title: lesson.title, reason: weak ? `Ce thème mérite un renforcement : ${weak.module.title}.` : placed ? 'Le point de départ que ton positionnement a désigné.' : 'La prochaine étape logique de ton parcours.' }
    : { type: 'complete', title: 'Parcours terminé', reason: 'Continue avec les révisions espacées pour consolider tes acquis.' }

  return {
    daily: { attempts: attemptsToday, goal, resetHour: hour, remaining: Math.max(0, goal - attemptsToday), percent: Math.min(100, Math.round(attemptsToday / goal * 100)) },
    recommendation,
  }
}
