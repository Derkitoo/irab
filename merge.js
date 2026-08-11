function unique(values = []) {
  return [...new Set(values)]
}

function bestCard(left, right) {
  if (!left) return right
  if (!right) return left
  if ((right.reps ?? 0) > (left.reps ?? 0)) return right
  if ((left.reps ?? 0) > (right.reps ?? 0)) return left
  return (right.due ?? '') > (left.due ?? '') ? right : left
}

export function normalizeProgress(progress = {}) {
  return {
    lessons: Array.isArray(progress.lessons) ? progress.lessons : [],
    questions: Array.isArray(progress.questions) ? progress.questions : [],
    wrongs: progress.wrongs && typeof progress.wrongs === 'object' ? progress.wrongs : {},
    cards: progress.cards && typeof progress.cards === 'object' ? progress.cards : {},
  }
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
    if (count > 0 && !unique([...local.questions, ...remote.questions]).includes(id)) wrongs[id] = count
  }
  return {
    lessons: unique([...local.lessons, ...remote.lessons]),
    questions: unique([...local.questions, ...remote.questions]),
    wrongs,
    cards,
  }
}
