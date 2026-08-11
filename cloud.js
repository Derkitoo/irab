import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js'

let client = null
let libraryPromise = null

export function isCloudConfigured() {
  return /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL) && SUPABASE_PUBLISHABLE_KEY.length > 20
}

function loadLibrary() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase)
  if (libraryPromise) return libraryPromise
  libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@supabase/supabase-js@2'
    script.async = true
    script.onload = () => resolve(window.supabase)
    script.onerror = () => reject(new Error('Impossible de charger le client Supabase'))
    document.head.append(script)
  })
  return libraryPromise
}

export async function initializeCloud() {
  if (!isCloudConfigured()) return null
  const library = await loadLibrary()
  client = library.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return client
}

function requireClient() {
  if (!client) throw new Error('Supabase non initialisé')
  return client
}

export async function currentSession() {
  const { data, error } = await requireClient().auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthChange(callback) {
  return requireClient().auth.onAuthStateChange((_event, session) => callback(session))
}

export async function signIn(email, password) {
  const { data, error } = await requireClient().auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signUp(email, password) {
  const { data, error } = await requireClient().auth.signUp({ email, password })
  if (error) throw error
  return data.session
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut()
  if (error) throw error
}

export async function loadCloudProgress(userId) {
  const { data, error } = await requireClient().from('learning_progress').select('progress, updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data?.progress ?? null
}

export async function saveCloudProgress(userId, progress) {
  const { error } = await requireClient().from('learning_progress').upsert({ user_id: userId, progress, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function deleteCloudProgress(userId) {
  const { error } = await requireClient().from('learning_progress').delete().eq('user_id', userId)
  if (error) throw error
}

// Supprime définitivement le compte via la fonction SQL `delete_own_account`.
// Le navigateur ne possède aucune clé d'administration : cette fonction est le
// seul chemin autorisé, et elle n'agit que sur l'utilisateur authentifié.
export async function deleteAccount() {
  const { error } = await requireClient().rpc('delete_own_account')
  if (error) throw error
}
