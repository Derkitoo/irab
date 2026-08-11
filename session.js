import { isMastered } from './mastery.js'
import { topicOf } from './question-topics.js'

// Une session rapide vise environ cinq minutes de travail utile.
// L'ordre de remplissage est délibéré : ce qui est dû aujourd'hui d'abord,
// puis les compétences les plus fragiles, puis la suite du parcours.
export const QUICK_SESSION_SIZE = 10

function accuracyByTopic(activity) {
  const totals = new Map()
  for (const event of activity) {
    const topic = topicOf(event?.questionId)
    if (!topic) continue
    const item = totals.get(topic) ?? { attempts: 0, errors: 0 }
    item.attempts += 1
    if (!event.correct) item.errors += 1
    totals.set(topic, item)
  }
  return totals
}

export function buildQuickSession(progress = {}, curriculum = [], dueIds = [], size = QUICK_SESSION_SIZE) {
  const catalog = curriculum.flatMap(module => (module.lessons ?? []).flatMap(lesson => (lesson.questions ?? []).map(question => question.id)))
  const known = new Set(catalog)
  const activity = Array.isArray(progress.activity) ? progress.activity : []
  const topicStats = accuracyByTopic(activity)

  // Un thème est fragile après au moins deux tentatives et moins de 70 % de réussite.
  const weakTopics = new Set(
    [...topicStats.entries()]
      .filter(([, item]) => item.attempts >= 2 && (item.attempts - item.errors) / item.attempts < 0.7)
      .sort((left, right) => (left[1].attempts - left[1].errors) / left[1].attempts - (right[1].attempts - right[1].errors) / right[1].attempts)
      .map(([topic]) => topic),
  )

  const due = dueIds.filter(id => known.has(id))
  const weak = catalog.filter(id => weakTopics.has(topicOf(id)) && !isMastered(progress, id))
  const fresh = catalog.filter(id => !isMastered(progress, id))

  const picked = []
  for (const id of [...due, ...weak, ...fresh]) {
    if (picked.length >= size) break
    if (!picked.includes(id)) picked.push(id)
  }

  return {
    questionIds: picked,
    // Ce qui explique la composition, affiché à l'apprenant avant de commencer.
    composition: {
      due: picked.filter(id => due.includes(id)).length,
      weak: picked.filter(id => !due.includes(id) && weak.includes(id)).length,
      fresh: picked.filter(id => !due.includes(id) && !weak.includes(id)).length,
    },
    weakTopics: [...weakTopics],
  }
}
