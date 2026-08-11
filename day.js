// Les jours de l'application suivent le fuseau de l'appareil, pas UTC.
// Une session commencée après minuit heure locale appartient au jour local,
// sinon elle s'affichait sur la barre de la veille et cassait la série.

export function localDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Midi local comme point d'ancrage : le décalage d'un changement d'heure ne
// peut alors jamais faire basculer la date d'un jour.
export function shiftLocalDays(value, days) {
  const date = value instanceof Date ? new Date(value) : new Date(value ?? Date.now())
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

export function localWeekdayLabel(value) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(value).replace('.', '')
}
