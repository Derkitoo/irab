import { localDayKey, localWeekdayLabel, shiftLocalDays } from './day.js'
import { isMastered } from './mastery.js'
import { TOPICS, topicOf } from './question-topics.js'

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export function computeAnalytics(progress = {}, curriculum = [], now = new Date()) {
  const activity = Array.isArray(progress.activity)
    ? progress.activity.filter(event => event && event.id && localDayKey(event.at) && event.questionId)
    : []
  const catalog = new Map()

  for (const module of curriculum) {
    for (const lesson of module.lessons ?? []) {
      for (const question of lesson.questions ?? []) {
        catalog.set(question.id, { moduleId: module.id, moduleTitle: module.title, prompt: question.prompt })
      }
    }
  }

  const correct = activity.filter(event => event.correct).length
  const days = []
  const activityByDay = new Map()
  for (const event of activity) {
    const key = localDayKey(event.at)
    activityByDay.set(key, (activityByDay.get(key) ?? 0) + 1)
  }
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = shiftLocalDays(now, -offset)
    const key = localDayKey(date)
    days.push({ key, label: localWeekdayLabel(date), attempts: activityByDay.get(key) ?? 0 })
  }

  const activeDays = new Set(activity.map(event => localDayKey(event.at)))
  let streak = 0
  let cursor = shiftLocalDays(now, 0)
  if (!activeDays.has(localDayKey(cursor))) cursor = shiftLocalDays(cursor, -1)
  while (activeDays.has(localDayKey(cursor))) {
    streak += 1
    cursor = shiftLocalDays(cursor, -1)
  }

  const modules = curriculum.map(module => {
    const ids = (module.lessons ?? []).flatMap(lesson => (lesson.questions ?? []).map(question => question.id))
    const events = activity.filter(event => ids.includes(event.questionId))
    const successes = events.filter(event => event.correct).length
    const mastered = ids.filter(id => isMastered(progress, id)).length
    return {
      id: module.id,
      title: module.title,
      mastered,
      total: ids.length,
      mastery: percent(mastered, ids.length),
      attempts: events.length,
      accuracy: percent(successes, events.length),
    }
  })

  // Répartition par compétence : c'est elle qui dit à l'apprenant si ses erreurs
  // portent sur la nature des mots, leur fonction, leur état ou leur marque.
  const topics = TOPICS.map(topic => {
    const ids = [...catalog.keys()].filter(id => topicOf(id) === topic.id)
    const events = activity.filter(event => topicOf(event.questionId) === topic.id)
    const errors = events.filter(event => !event.correct).length
    const mastered = ids.filter(id => isMastered(progress, id)).length
    return {
      id: topic.id,
      label: topic.label,
      total: ids.length,
      mastered,
      mastery: percent(mastered, ids.length),
      attempts: events.length,
      errors,
      accuracy: percent(events.length - errors, events.length),
    }
  })

  const troubleMap = new Map()
  for (const event of activity) {
    const item = troubleMap.get(event.questionId) ?? { questionId: event.questionId, errors: 0, attempts: 0 }
    item.attempts += 1
    if (!event.correct) item.errors += 1
    troubleMap.set(event.questionId, item)
  }
  const trouble = [...troubleMap.values()]
    .filter(item => item.errors > 0)
    .sort((left, right) => right.errors - left.errors || right.attempts - left.attempts)
    .slice(0, 5)
    .map(item => ({ ...item, topic: topicOf(item.questionId), ...(catalog.get(item.questionId) ?? { prompt: item.questionId, moduleTitle: 'Exercice' }) }))

  const masteredTotal = [...catalog.keys()].filter(id => isMastered(progress, id)).length

  return { attempts: activity.length, correct, accuracy: percent(correct, activity.length), streak, days, modules, topics, trouble, mastered: masteredTotal }
}
