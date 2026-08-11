import { detectSchemaVersion, migrateProgress } from './progress-schema.js'

function unique(values = []) {
  return [...new Set(values)]
}

// La réponse la plus récente gagne : un échec remet `reps` à zéro, il ne doit
// donc jamais perdre contre une réussite plus ancienne mieux dotée en `reps`.
// Les cartes d'avant l'horodatage retombent sur l'ancienne règle.
function bestCard(left, right) {
  if (!left) return right
  if (!right) return left
  const leftAt = String(left.at ?? '')
  const rightAt = String(right.at ?? '')
  if (leftAt && rightAt && leftAt !== rightAt) return rightAt > leftAt ? right : left
  if (leftAt && !rightAt) return left
  if (rightAt && !leftAt) return right
  if ((right.reps ?? 0) !== (left.reps ?? 0)) return (right.reps ?? 0) > (left.reps ?? 0) ? right : left
  return (right.due ?? '') > (left.due ?? '') ? right : left
}

export function normalizeProgress(progress = {}) {
  return migrateProgress(progress)
}

export function mergeProgress(localProgress, remoteProgress) {
  const local = normalizeProgress(localProgress)
  const remote = normalizeProgress(remoteProgress)
  const cards = {}
  for (const id of new Set([...Object.keys(local.cards), ...Object.keys(remote.cards)])) {
    cards[id] = bestCard(local.cards[id], remote.cards[id])
  }
  const wrongs = {}
  for (const id of new Set([...Object.keys(local.wrongs), ...Object.keys(remote.wrongs)])) {
    const count = Math.max(local.wrongs[id] ?? 0, remote.wrongs[id] ?? 0)
    // Une erreur reste à revoir tant que la dernière réponse connue n'est pas une
    // réussite. La carte retenue porte cette information : `reps` repasse à zéro
    // à chaque échec. Une réussite plus ancienne n'efface donc plus l'échec.
    const lastAnswerSucceeded = (cards[id]?.reps ?? 0) > 0
    if (count > 0 && !lastAnswerSucceeded) wrongs[id] = count
  }
  return {
    schemaVersion: Math.max(detectSchemaVersion(local), detectSchemaVersion(remote)),
    lessons: unique([...local.lessons, ...remote.lessons]),
    questions: unique([...local.questions, ...remote.questions]),
    wrongs,
    cards,
    activity: [...new Map([...local.activity, ...remote.activity].map(event => [event.id, event])).values()]
      .sort((left, right) => String(left.at).localeCompare(String(right.at)))
      .slice(-1000),
    preferences: String(remote.preferences.updatedAt ?? '') > String(local.preferences.updatedAt ?? '') ? remote.preferences : local.preferences,
  }
}
