import assert from 'node:assert/strict'
import { dateKey, isDue, scheduleCard } from './srs.js'

const now = new Date(2026, 7, 11, 12, 0, 0)

assert.equal(dateKey(now), '2026-08-11')

const first = scheduleCard(undefined, true, now)
assert.deepEqual(first, { reps: 1, interval: 1, ease: 2.55, due: '2026-08-12', at: now.toISOString() })

const second = scheduleCard(first, true, now)
assert.equal(second.reps, 2)
assert.equal(second.interval, 3)
assert.equal(second.due, '2026-08-14')

const third = scheduleCard(second, true, now)
assert.equal(third.reps, 3)
assert.ok(third.interval >= 4)

const failed = scheduleCard(second, false, now)
assert.equal(failed.reps, 0)
assert.equal(failed.interval, 0)
assert.equal(failed.due, '2026-08-11')
assert.equal(isDue(failed, now), true)
assert.equal(isDue(first, now), false)

// Chaque réponse laisse un horodatage : la fusion entre appareils s'en sert.
const later = new Date(2026, 7, 12, 9, 30, 0)
assert.equal(scheduleCard(first, false, later).at, later.toISOString())
assert.ok(scheduleCard(first, false, later).at > first.at)

console.log('SRS tests passed')
