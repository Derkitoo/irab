import { migrateProgress } from './progress-schema.js'

export function createBackup(progress, exportedAt = new Date()) {
  return {
    app: 'irab-fr',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    progress: migrateProgress(progress),
  }
}

export function parseBackup(text) {
  const payload = JSON.parse(text)
  const progress = payload?.progress
  if (
    payload?.app !== 'irab-fr' ||
    payload?.version !== 1 ||
    !progress ||
    !Array.isArray(progress.lessons) ||
    !Array.isArray(progress.questions)
  ) {
    throw new Error('Invalid Iʿrāb backup')
  }
  return migrateProgress(progress)
}
