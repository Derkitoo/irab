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
  const source = progress && typeof progress === 'object' ? progress : {}
  return {
    lessons: Array.isArray(source.lessons) ? source.lessons : [],
    questions: Array.isArray(source.questions) ? source.questions : [],
    wrongs: source.wrongs && typeof source.wrongs === 'object' ? source.wrongs : {},
    cards: source.cards && typeof source.cards === 'object' ? source.cards : {},
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
