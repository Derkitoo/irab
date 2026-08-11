function dayKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export function computeAnalytics(progress = {}, curriculum = [], now = new Date()) {
  const activity = Array.isArray(progress.activity)
    ? progress.activity.filter(event => event && event.id && dayKey(event.at) && event.questionId)
    : []
  const mastered = new Set(Array.isArray(progress.questions) ? progress.questions : [])
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
    const key = dayKey(event.at)
    activityByDay.set(key, (activityByDay.get(key) ?? 0) + 1)
  }
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setUTCHours(12, 0, 0, 0)
    date.setUTCDate(date.getUTCDate() - offset)
    const key = dayKey(date)
    days.push({ key, label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' }).format(date).replace('.', ''), attempts: activityByDay.get(key) ?? 0 })
  }

  const activeDays = new Set(activity.map(event => dayKey(event.at)))
  let streak = 0
  const cursor = new Date(now)
  cursor.setUTCHours(12, 0, 0, 0)
  if (!activeDays.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (activeDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  const modules = curriculum.map(module => {
    const ids = (module.lessons ?? []).flatMap(lesson => (lesson.questions ?? []).map(question => question.id))
    const events = activity.filter(event => ids.includes(event.questionId))
    const successes = events.filter(event => event.correct).length
    return {
      id: module.id,
      title: module.title,
      mastered: ids.filter(id => mastered.has(id)).length,
      total: ids.length,
      mastery: percent(ids.filter(id => mastered.has(id)).length, ids.length),
      attempts: events.length,
      accuracy: percent(successes, events.length),
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
    .map(item => ({ ...item, ...(catalog.get(item.questionId) ?? { prompt: item.questionId, moduleTitle: 'Exercice' }) }))

  return { attempts: activity.length, correct, accuracy: percent(correct, activity.length), streak, days, modules, trouble }
}
