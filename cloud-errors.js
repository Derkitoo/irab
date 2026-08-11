// Traduit une erreur Supabase, réseau ou navigateur en message compréhensible.
// `retryable` indique si proposer un bouton « Réessayer » a du sens.

const GENERIC = {
  message: 'La synchronisation a échoué. Ta progression reste enregistrée sur cet appareil.',
  retryable: true,
}

function textOf(error) {
  if (!error) return ''
  if (typeof error === 'string') return error
  return [error.message, error.error_description, error.details, error.hint, error.code].filter(Boolean).join(' · ')
}

function statusOf(error) {
  const status = Number(error?.status ?? error?.statusCode)
  return Number.isFinite(status) ? status : 0
}

const RULES = [
  {
    match: (text, status, error) => error?.name === 'TypeError' || /failed to fetch|networkerror|network request failed|load failed/i.test(text),
    message: 'Le serveur est injoignable. Vérifie ta connexion puis réessaie.',
    retryable: true,
  },
  {
    match: text => /impossible de charger le client supabase/i.test(text),
    message: 'Le module de synchronisation n’a pas pu être téléchargé. Réessaie une fois connecté au réseau.',
    retryable: true,
  },
  {
    match: text => /supabase non initialisé/i.test(text),
    message: 'La synchronisation n’est pas encore prête. Réessaie dans quelques secondes.',
    retryable: true,
  },
  {
    match: (text, status) => status === 429 || /rate limit|too many requests|for security purposes/i.test(text),
    message: 'Trop de tentatives en peu de temps. Patiente une minute avant de réessayer.',
    retryable: true,
  },
  {
    match: (text, status) => status === 504 || /timeout|timed out/i.test(text),
    message: 'Le serveur met trop de temps à répondre. Réessaie dans un instant.',
    retryable: true,
  },
  {
    match: (text, status) => status >= 500,
    message: 'Le service de synchronisation est momentanément indisponible. Réessaie plus tard.',
    retryable: true,
  },
  {
    match: text => /invalid login credentials/i.test(text),
    message: 'Adresse e-mail ou mot de passe incorrect.',
    retryable: false,
  },
  {
    match: text => /email not confirmed/i.test(text),
    message: 'Ton adresse e-mail n’est pas encore confirmée. Ouvre le lien reçu par e-mail puis reconnecte-toi.',
    retryable: false,
  },
  {
    match: text => /already registered|already exists|user_already_exists/i.test(text),
    message: 'Un compte existe déjà avec cette adresse. Utilise « Se connecter ».',
    retryable: false,
  },
  {
    match: text => /password should be at least|weak.?password|password.*6 characters/i.test(text),
    message: 'Mot de passe trop court : utilise au moins 8 caractères.',
    retryable: false,
  },
  {
    match: text => /invalid email|unable to validate email|email_address_invalid/i.test(text),
    message: 'Cette adresse e-mail n’est pas valide.',
    retryable: false,
  },
  {
    match: text => /signups? not allowed|signup_disabled/i.test(text),
    message: 'La création de compte est désactivée sur ce serveur.',
    retryable: false,
  },
  {
    match: (text, status) => status === 401 || /jwt expired|invalid token|session_not_found|refresh_token/i.test(text),
    message: 'Ta session a expiré. Reconnecte-toi pour reprendre la synchronisation.',
    retryable: false,
  },
  {
    match: text => /pgrst202|could not find the function/i.test(text),
    message: 'La suppression définitive du compte n’est pas encore activée sur le serveur. Exécute supabase/schema.sql puis réessaie.',
    retryable: false,
  },
  {
    match: (text, status) => status === 403 || /row-level security|42501|permission denied/i.test(text),
    message: 'Le serveur a refusé l’accès à ces données. Déconnecte-toi puis reconnecte-toi.',
    retryable: false,
  },
  {
    match: text => /pgrst205|relation .* does not exist|42p01/i.test(text),
    message: 'La table de progression est absente du projet Supabase. Exécute supabase/schema.sql.',
    retryable: false,
  },
]

export function describeCloudError(error, { online = true } = {}) {
  if (!online) {
    return {
      message: 'Tu es hors ligne. Ta progression est enregistrée sur cet appareil et sera synchronisée au retour du réseau.',
      retryable: true,
    }
  }
  const text = textOf(error)
  const status = statusOf(error)
  const rule = RULES.find(item => item.match(text, status, error))
  return rule ? { message: rule.message, retryable: rule.retryable } : { ...GENERIC }
}
