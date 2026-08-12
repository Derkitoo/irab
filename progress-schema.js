// Version 0 : format d'origine, sans numéro de version — lessons, questions, wrongs, cards.
// Version 1 : journal d'activité, préférences et numéro de version explicites.
export const CURRENT_SCHEMA_VERSION = 1

export const FUTURE_SCHEMA_MESSAGE =
  'Cette progression a été enregistrée par une version plus récente de l’application. Actualise la page pour la mettre à jour ; en attendant, rien n’est modifié côté cloud.'

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function stringList(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

// Trace du positionnement initial : de quoi orienter le coach, rien de plus.
function diagnosticPoint(value) {
  const source = plainObject(value)
  if (typeof source.lessonId !== 'string' || !source.lessonId) return null
  return {
    at: typeof source.at === 'string' ? source.at : '',
    moduleId: typeof source.moduleId === 'string' ? source.moduleId : '',
    lessonId: source.lessonId,
    correct: Number.isInteger(source.correct) && source.correct >= 0 ? source.correct : 0,
    answered: Number.isInteger(source.answered) && source.answered >= 0 ? source.answered : 0,
  }
}

// Point de reprise : la leçon et la question quittées en cours de route.
function resumePoint(value) {
  const source = plainObject(value)
  if (typeof source.lessonId !== 'string' || !source.lessonId) return null
  return {
    lessonId: source.lessonId,
    index: Number.isInteger(source.index) && source.index >= 0 ? source.index : 0,
    at: typeof source.at === 'string' ? source.at : '',
  }
}

export function detectSchemaVersion(progress) {
  const version = Number(plainObject(progress).schemaVersion)
  return Number.isInteger(version) && version >= 0 ? version : 0
}

export function isFutureSchema(progress) {
  return detectSchemaVersion(progress) > CURRENT_SCHEMA_VERSION
}

// Une migration par palier de version : elle reçoit le format précédent et rend le suivant.
const migrations = {
  0: source => ({
    ...source,
    activity: Array.isArray(source.activity) ? source.activity : [],
    preferences: plainObject(source.preferences),
  }),
}

// Les champs inconnus sont conservés : une version plus ancienne ne doit jamais
// détruire les données écrites par une version plus récente.
function shape(source) {
  return {
    ...source,
    schemaVersion: Math.max(CURRENT_SCHEMA_VERSION, detectSchemaVersion(source)),
    lessons: stringList(source.lessons),
    questions: stringList(source.questions),
    wrongs: plainObject(source.wrongs),
    cards: plainObject(source.cards),
    activity: (Array.isArray(source.activity) ? source.activity : []).filter(event => plainObject(event).id),
    preferences: plainObject(source.preferences),
    resume: resumePoint(source.resume),
    diagnostic: diagnosticPoint(source.diagnostic),
  }
}

export function migrateProgress(raw) {
  let current = plainObject(raw)
  for (let version = detectSchemaVersion(current); version < CURRENT_SCHEMA_VERSION; version += 1) {
    const migration = migrations[version]
    if (!migration) throw new Error(`Migration manquante pour la version ${version} du format de progression`)
    current = plainObject(migration(current))
  }
  return shape(current)
}

export function emptyProgress() {
  return migrateProgress({})
}
