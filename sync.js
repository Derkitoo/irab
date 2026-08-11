import { describeCloudError } from './cloud-errors.js'
import { mergeProgress } from './merge.js'
import { FUTURE_SCHEMA_MESSAGE, isFutureSchema, migrateProgress } from './progress-schema.js'

// Résultat commun : { status, progress, error }
// status vaut 'synced', 'blocked' (format distant plus récent) ou 'error'.

export async function synchronize({ userId, local, loadRemote, saveRemote, online = true }) {
  const current = migrateProgress(local)
  try {
    const remote = await loadRemote(userId)
    if (isFutureSchema(remote)) {
      return { status: 'blocked', progress: current, error: { message: FUTURE_SCHEMA_MESSAGE, retryable: false } }
    }
    const merged = mergeProgress(current, remote)
    await saveRemote(userId, merged)
    return { status: 'synced', progress: merged, error: null }
  } catch (error) {
    return { status: 'error', progress: current, error: describeCloudError(error, { online }) }
  }
}

export async function publish({ userId, progress, saveRemote, online = true }) {
  const current = migrateProgress(progress)
  try {
    await saveRemote(userId, current)
    return { status: 'synced', progress: current, error: null }
  } catch (error) {
    return { status: 'error', progress: current, error: describeCloudError(error, { online }) }
  }
}
