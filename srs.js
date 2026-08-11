export function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return dateKey(next)
}

// `at` horodate la dernière réponse. C'est ce qui permet à la fusion entre
// appareils de départager deux versions d'une même carte sans perdre un échec.
export function scheduleCard(previous, correct, now = new Date()) {
  const card = previous ?? { reps: 0, interval: 0, ease: 2.5, due: dateKey(now) }
  if (!correct) {
    return {
      reps: 0,
      interval: 0,
      ease: Math.max(1.3, card.ease - 0.2),
      due: dateKey(now),
      at: now.toISOString(),
    }
  }

  const reps = card.reps + 1
  const interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.max(4, Math.round(card.interval * card.ease))
  return {
    reps,
    interval,
    ease: Math.min(3, card.ease + 0.05),
    due: addDays(now, interval),
    at: now.toISOString(),
  }
}

export function isDue(card, now = new Date()) {
  return Boolean(card?.due && card.due <= dateKey(now))
}
