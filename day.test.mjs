import assert from 'node:assert/strict'
import { goalDayKey, localDayKey, localWeekdayLabel, shiftLocalDays } from './day.js'

// Le jour vient de l'horloge de l'appareil, pas d'UTC.
const evening = new Date(2026, 7, 12, 23, 30, 0)
const afterMidnight = new Date(2026, 7, 13, 0, 30, 0)
assert.equal(localDayKey(evening), '2026-08-12')
assert.equal(localDayKey(afterMidnight), '2026-08-13')
assert.equal(localDayKey(new Date(2026, 0, 5)), '2026-01-05')
assert.equal(localDayKey('pas une date'), null)
assert.equal(localDayKey(new Date(2026, 7, 12, 23, 30).toISOString()), '2026-08-12')

// Le décalage s'ancre à midi : un changement d'heure ne peut pas faire glisser
// la date d'un jour.
assert.equal(localDayKey(shiftLocalDays(evening, -1)), '2026-08-11')
assert.equal(localDayKey(shiftLocalDays(evening, 0)), '2026-08-12')
assert.equal(localDayKey(shiftLocalDays(new Date(2026, 2, 29, 23, 0), -1)), '2026-03-28')
assert.equal(localDayKey(shiftLocalDays(new Date(2026, 0, 1, 1, 0), -1)), '2025-12-31')

assert.equal(localWeekdayLabel(new Date(2026, 7, 12)), 'mer')

// Journée d'objectif : sans réglage elle commence à minuit.
assert.equal(goalDayKey(afterMidnight, 0), '2026-08-13')
// Avec une bascule à 4 h, une révision de 0 h 30 appartient encore à la veille.
assert.equal(goalDayKey(afterMidnight, 4), '2026-08-12')
assert.equal(goalDayKey(evening, 4), '2026-08-12')
// À 4 h passées, la nouvelle journée commence.
assert.equal(goalDayKey(new Date(2026, 7, 13, 4, 30), 4), '2026-08-13')
// Une heure invalide retombe sur minuit.
assert.equal(goalDayKey(afterMidnight, 30), '2026-08-13')
assert.equal(goalDayKey(afterMidnight, -2), '2026-08-13')
assert.equal(goalDayKey(afterMidnight, 'tard'), '2026-08-13')
assert.equal(goalDayKey('pas une date', 4), null)

console.log('Day tests passed')
