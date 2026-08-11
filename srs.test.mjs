import assert from 'node:assert/strict'
import { dateKey, isDue, scheduleCard } from './srs.js'

const now = new Date(2026, 7, 11, 12, 0, 0)

assert.equal(dateKey(now), '2026-08-11')

const first = scheduleCard(undefined, true, now)
assert.deepEqual(first, { reps: 1, interval: 1, ease: 2.55, due: '2026-08-12' })

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

console.log('SRS tests passed')
