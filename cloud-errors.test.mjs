import assert from 'node:assert/strict'
import { describeCloudError } from './cloud-errors.js'

const offline = describeCloudError(new Error('Failed to fetch'), { online: false })
assert.match(offline.message, /hors ligne/i)
assert.equal(offline.retryable, true)

assert.equal(describeCloudError(new TypeError('Failed to fetch')).retryable, true)
assert.match(describeCloudError(new TypeError('Failed to fetch')).message, /injoignable/i)

assert.match(describeCloudError(new Error('Impossible de charger le client Supabase')).message, /téléchargé/i)

const credentials = describeCloudError({ message: 'Invalid login credentials', status: 400 })
assert.match(credentials.message, /mot de passe incorrect/i)
assert.equal(credentials.retryable, false)

assert.match(describeCloudError({ message: 'Email not confirmed', status: 400 }).message, /confirmée/i)
assert.match(describeCloudError({ message: 'User already registered', status: 422 }).message, /existe déjà/i)
assert.match(describeCloudError({ message: 'Password should be at least 6 characters' }).message, /8 caractères/i)
assert.match(describeCloudError({ message: 'Unable to validate email address' }).message, /pas valide/i)

const rateLimited = describeCloudError({ message: 'Request rate limit reached', status: 429 })
assert.match(rateLimited.message, /Patiente/i)
assert.equal(rateLimited.retryable, true)

const serverDown = describeCloudError({ message: 'Internal Server Error', status: 503 })
assert.match(serverDown.message, /indisponible/i)
assert.equal(serverDown.retryable, true)

const expired = describeCloudError({ message: 'JWT expired', status: 401 })
assert.match(expired.message, /session a expiré/i)
assert.equal(expired.retryable, false)

assert.match(describeCloudError({ code: 'PGRST202', message: 'Could not find the function public.delete_own_account' }).message, /suppression définitive/i)
assert.match(describeCloudError({ code: '42501', message: 'new row violates row-level security policy' }).message, /refusé l’accès/i)
assert.match(describeCloudError({ code: 'PGRST205', message: 'Could not find the table' }).message, /schema\.sql/i)

const unknown = describeCloudError(new Error('quelque chose d’inattendu'))
assert.match(unknown.message, /synchronisation a échoué/i)
assert.equal(unknown.retryable, true)
assert.match(describeCloudError(null).message, /synchronisation a échoué/i)

console.log('Cloud error tests passed')
