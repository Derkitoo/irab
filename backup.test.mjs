import assert from 'node:assert/strict'
import { createBackup, parseBackup } from './backup.js'

const progress = {
  lessons: ['types'],
  questions: ['types-1'],
  wrongs: {},
  cards: { 'types-1': { reps: 1, interval: 1, ease: 2.55, due: '2026-08-12' } },
  activity: [{ id: 'a1', at: '2026-08-11T11:00:00Z', questionId: 'types-1', correct: true }],
}

const payload = createBackup(progress, new Date('2026-08-11T12:00:00Z'))
assert.equal(payload.app, 'irab-fr')
assert.equal(payload.version, 1)
assert.deepEqual(parseBackup(JSON.stringify(payload)), progress)

const legacyProgress = { lessons: ['types'], questions: [], wrongs: {}, cards: {} }
const restoredLegacy = parseBackup(JSON.stringify({ app: 'irab-fr', version: 1, progress: legacyProgress }))
assert.deepEqual(restoredLegacy.activity, [])

assert.throws(() => parseBackup('{}'))
assert.throws(() => parseBackup('{broken'))
assert.throws(() => parseBackup(JSON.stringify({ app: 'another-app', version: 1, progress })))

console.log('Backup tests passed')
