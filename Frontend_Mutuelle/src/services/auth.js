const SESSION_KEY = 'mutuelle_session'

/**
 * @typedef {'membre' | 'administration'} AuthType
 */

/**
 * @typedef {object} AuthSession
 * @property {AuthType} type
 * @property {object} user
 * @property {string} loggedAt
 */

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return /** @type {AuthSession} */ (JSON.parse(raw))
  } catch {
    return null
  }
}

/** @param {AuthSession} session */
export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('auth-change'))
}

/** Met à jour le profil membre stocké en session */
export function updateMembreSession(user) {
  const session = getSession()
  if (!session || session.type !== 'membre') return
  setSession({
    ...session,
    user,
    loggedAt: new Date().toISOString(),
  })
}

/** Met à jour la session administration (poste + membre occupant) */
export function updateAdminSession(poste) {
  const session = getSession()
  if (!session || session.type !== 'administration') return
  setSession({
    ...session,
    user: poste,
    loggedAt: new Date().toISOString(),
  })
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('auth-change'))
}

export function isAuthenticated() {
  return getSession() !== null
}

export function isMembre() {
  return getSession()?.type === 'membre'
}

/** @returns {string | null} */
export function getPosteIntitule() {
  const session = getSession()
  if (session?.type !== 'administration') return null
  return session.user?.intitule ?? null
}

export function isSecretaireGeneral() {
  return getPosteIntitule() === 'SECRETAIRE_GENERAL'
}

export function isTresorier() {
  return getPosteIntitule() === 'TRESORIER'
}

export function isPresident() {
  return getPosteIntitule() === 'PRESIDENT'
}

export function isCommissaire() {
  return getPosteIntitule() === 'COMMISSAIRE_AUX_COMPTES'
}

/**
 * Route d’accueil selon le profil connecté.
 * Parcours membre : activer compte → payer inscription → espace.
 */
export function getHomePath() {
  const session = getSession()
  if (!session) return '/connexion'

  if (session.type === 'administration') {
    if (session.user?.intitule === 'SECRETAIRE_GENERAL') return '/sg/membres'
    if (session.user?.intitule === 'TRESORIER') return '/tr/caisses'
    if (session.user?.intitule === 'PRESIDENT') return '/president'
    if (session.user?.intitule === 'COMMISSAIRE_AUX_COMPTES') {
      return '/commissaire'
    }
    return '/espace'
  }

  const membre = session.user
  if (!membre?.compteVerifie) return '/membre/activer'
  if (!membre?.inscriptionPayee) return '/membre/inscription'
  return '/membre/epargne'
}
