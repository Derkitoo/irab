import assert from 'node:assert/strict'
import { CURRENT_SCHEMA_VERSION, detectSchemaVersion, emptyProgress, isFutureSchema, migrateProgress } from './progress-schema.js'

assert.deepEqual(emptyProgress(), {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  lessons: [],
  questions: [],
  wrongs: {},
  cards: {},
  activity: [],
  preferences: {},
})

assert.equal(detectSchemaVersion(undefined), 0)
assert.equal(detectSchemaVersion({ schemaVersion: 'deux' }), 0)
assert.equal(detectSchemaVersion({ schemaVersion: 3 }), 3)

// Une sauvegarde d'origine reste lisible et reçoit le journal et les préférences.
const legacy = migrateProgress({ lessons: ['types'], questions: ['types-1'], wrongs: { 'types-2': 1 }, cards: {} })
assert.equal(legacy.schemaVersion, CURRENT_SCHEMA_VERSION)
assert.deepEqual(legacy.lessons, ['types'])
assert.deepEqual(legacy.activity, [])
assert.deepEqual(legacy.preferences, {})

// Une progression déjà migrée n'est pas modifiée deux fois.
assert.deepEqual(migrateProgress(legacy), legacy)

// Les entrées d'activité sans identifiant sont écartées.
assert.deepEqual(migrateProgress({ activity: [{ at: '2026-08-11T10:00:00Z' }, { id: 'a1' }] }).activity, [{ id: 'a1' }])

// Les types incohérents ne font pas planter la migration.
assert.deepEqual(migrateProgress(null).lessons, [])
assert.deepEqual(migrateProgress({ lessons: 'types', wrongs: [] }).wrongs, {})
assert.deepEqual(migrateProgress({ lessons: ['ok', 3, null] }).lessons, ['ok'])

// Un format plus récent est détecté et ses champs inconnus sont préservés.
const future = { schemaVersion: CURRENT_SCHEMA_VERSION + 1, lessons: ['types'], badges: ['first-analysis'] }
assert.equal(isFutureSchema(future), true)
assert.equal(isFutureSchema(legacy), false)
const keptFuture = migrateProgress(future)
assert.equal(keptFuture.schemaVersion, CURRENT_SCHEMA_VERSION + 1)
assert.deepEqual(keptFuture.badges, ['first-analysis'])

console.log('Progress schema tests passed')
