import { setSession, clearSession, updateMembreSession } from './auth'

/** Base API : vide en dev (proxy Vite), URL absolue en prod/PWA réseau. */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function apiUrl(endpoint) {
  return `${API_BASE}${endpoint}`
}

/**
 * @param {string} endpoint
 * @param {RequestInit} [options]
 */
async function request(endpoint, options = {}) {
  let response
  try {
    response = await fetch(apiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch {
    throw new Error(
      'Impossible de joindre le serveur. Vérifiez que le backend est démarré.',
    )
  }

  const raw = await response.text()
  if (!raw) {
    throw new Error(
      response.ok
        ? 'Réponse serveur vide'
        : 'Serveur indisponible. Vérifiez que l’API Mutuelle tourne (port 8081).',
    )
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(
      'Réponse serveur invalide. Vérifiez que le proxy pointe vers le bon backend.',
    )
  }

  if (!response.ok) {
    const message =
      (typeof data === 'string' && data) ||
      (data && (data.message || data.error)) ||
      `Erreur serveur (${response.status})`
    throw new Error(message)
  }

  if (data && typeof data === 'object' && data.success === false) {
    throw new Error(data.message || 'Opération refusée')
  }

  return data
}

/**
 * @param {string} endpoint
 * @param {{ login: string, password: string }} body
 */
async function postLogin(endpoint, body) {
  const data = await request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (data.success === false) {
    throw new Error(data.message || 'Échec de la connexion')
  }
  return data
}

export const api = {
  /**
   * @param {string} login
   * @param {string} password
   */
  async loginMembre(login, password) {
    const data = await postLogin('/api/auth/login-membre', { login, password })
    setSession({
      type: 'membre',
      user: data.data,
      loggedAt: new Date().toISOString(),
    })
    return data
  },

  /**
   * @param {string} login
   * @param {string} password
   */
  async loginAdministration(login, password) {
    const data = await postLogin('/api/auth/login-administration', {
      login,
      password,
    })
    setSession({
      type: 'administration',
      user: data.data,
      loggedAt: new Date().toISOString(),
    })
    return data
  },

  logout() {
    clearSession()
  },

  /** @returns {Promise<object[]>} */
  async getMembres() {
    return request('/api/membres')
  },

  /** @param {string} id */
  async getMembre(id) {
    return request(`/api/membres/${id}`)
  },

  /**
   * @param {{
   *   nom: string,
   *   prenom?: string,
   *   couriel: string,
   *   telephone: string,
   *   photo?: string,
   *   inscriptionPayee?: boolean
   * }} payload
   */
  async createMembre(payload) {
    return request('/api/membres', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Change le mot de passe membre.
   * Si le compte est déjà activé, `ancienMotDePasse` est obligatoire.
   * @param {string} membreId
   * @param {string} nouveauMotDePasse
   * @param {string} [ancienMotDePasse]
   */
  async modifierMotDePasse(membreId, nouveauMotDePasse, ancienMotDePasse) {
    const body = { nouveauMotDePasse }
    if (ancienMotDePasse != null && ancienMotDePasse !== '') {
      body.ancienMotDePasse = ancienMotDePasse
    }
    const data = await request(`/api/membres/${membreId}/modifier-mot-de-passe`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (data?.data) {
      updateMembreSession(data.data)
    }
    return data
  },

  /** @returns {Promise<number>} */
  async getMontantInscription() {
    const value = await request('/api/parametres/montant-inscription')
    return Number(value)
  },

  /** @returns {Promise<number>} */
  async getMontantSolidarite() {
    const value = await request('/api/parametres/montant-solidarite')
    return Number(value)
  },

  /** @returns {Promise<object>} Paramètres généraux (taux, facteur emprunt, caisses…). */
  async getParametres() {
    return request('/api/parametres')
  },

  /**
   * Mise à jour des paramètres généraux (hors caisses — gérées par les flux métier).
   * @param {object} payload
   */
  async updateParametres(payload) {
    return request('/api/parametres', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Mise à jour du profil d’un membre (SG).
   * @param {string} id
   * @param {object} payload
   */
  async updateMembre(id, payload) {
    return request(`/api/membres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async ouvrirExercice() {
    return request('/api/exercices/ouvrir', { method: 'POST' })
  },

  async ouvrirExerciceForce() {
    return request('/api/exercices/ouvrir-force', { method: 'POST' })
  },

  async cloturerExercice() {
    return request('/api/exercices/cloturer', { method: 'POST' })
  },

  /** @returns {Promise<object|null>} Exercice en cours ou null (204). */
  async getExerciceEnCours() {
    const response = await fetch(apiUrl('/api/exercices/en-cours'), {
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status === 204) return null
    const raw = await response.text()
    if (!raw) {
      if (response.ok) return null
      throw new Error('Exercice indisponible')
    }
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error('Réponse serveur invalide')
    }
    if (!response.ok) {
      const message =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        'Impossible de charger l’exercice'
      throw new Error(message)
    }
    return data
  },

  /** @returns {Promise<object[]>} */
  async getExercices() {
    return request('/api/exercices')
  },

  /** @returns {Promise<object[]>} */
  async getPostes() {
    return request('/api/postes')
  },

  /** @returns {Promise<object>} */
  async getPoste(id) {
    return request(`/api/postes/${id}`)
  },

  /**
   * @param {string} id
   * @param {object} payload
   */
  async updatePoste(id, payload) {
    return request(`/api/postes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  /** @param {string} membreId */
  async getSoldeTotal(membreId) {
    return request(`/api/membres/${membreId}/solde-total`)
  },

  /**
   * Demande de paiement d’inscription (statut en_attente côté trésorier).
   * @param {string} membreId
   * @param {number} montant
   */
  async demanderInscription(membreId, montant) {
    return request('/api/versements/inscription', {
      method: 'POST',
      body: JSON.stringify({ membreId, montant }),
    })
  },

  /**
   * Demande de paiement de solidarité (partiel ou total ≤ dette).
   * @param {string} membreId
   * @param {number} montant
   */
  async demanderSolidarite(membreId, montant) {
    return request('/api/versements/solidarite', {
      method: 'POST',
      body: JSON.stringify({ membreId, montant }),
    })
  },

  /**
   * Demande de versement d’épargne.
   * @param {string} membreId
   * @param {number} montant
   */
  async demanderEpargne(membreId, montant) {
    return request('/api/versements/epargne', {
      method: 'POST',
      body: JSON.stringify({ membreId, montant }),
    })
  },

  /** @param {string} membreId @param {string} [raison] */
  async getVersementsMembre(membreId, raison) {
    const q = raison ? `?raison=${encodeURIComponent(raison)}` : ''
    return request(`/api/versements/membre/${membreId}${q}`)
  },

  /** @param {string} membreId */
  async getSortiesMembre(membreId) {
    return request(`/api/membres/${membreId}/sorties`)
  },

  /** @param {string} membreId */
  async getPretsMembre(membreId) {
    return request(`/api/membres/${membreId}/prets`)
  },

  async getAidesParametres() {
    return request('/api/aides-parametres')
  },

  /** @param {string} membreId */
  async getEligibleAide(membreId) {
    return request(`/api/membres/${membreId}/eligible-aide`)
  },

  /** @param {string} membreId */
  async getEligiblePret(membreId) {
    return request(`/api/membres/${membreId}/eligible-pret`)
  },

  /**
   * @param {string} membreId
   * @param {string} typeAide
   */
  async demanderAide(membreId, typeAide) {
    return request('/api/sorties/demande-aide', {
      method: 'POST',
      body: JSON.stringify({ membreId, typeAide }),
    })
  },

  /**
   * @param {string} membreId
   * @param {number} montant
   */
  async demanderPret(membreId, montant) {
    return request('/api/sorties/demande-pret', {
      method: 'POST',
      body: JSON.stringify({ membreId, montant }),
    })
  },

  /**
   * @param {string} membreId
   * @param {number} montant
   */
  async demanderRetrait(membreId, montant) {
    return request('/api/sorties/demande-retrait', {
      method: 'POST',
      body: JSON.stringify({ membreId, montant }),
    })
  },

  /** @param {string} sortieId */
  async confirmerSortie(sortieId) {
    return request(`/api/sorties/${sortieId}/confirmer-membre`, {
      method: 'POST',
    })
  },

  async getSimulationHorloge() {
    return request('/api/simulation/horloge')
  },

  /** @param {string} date ISO, ex. 2026-10-25T12:00:00 */
  async setSimulationHorloge(date) {
    return request('/api/simulation/horloge', {
      method: 'POST',
      body: JSON.stringify({ date }),
    })
  },

  async resetSimulationHorloge() {
    return request('/api/simulation/horloge', { method: 'DELETE' })
  },

  async verifierEcheancesPrets() {
    return request('/api/prets/verifier-echeances', { method: 'POST' })
  },

  /** @returns {Promise<object[]>} */
  async getVersementsEnAttente() {
    return request('/api/versements/en-attente')
  },

  /** @returns {Promise<object[]>} @param {string} [raison] */
  async getTousVersements(raison) {
    const q = raison ? `?raison=${encodeURIComponent(raison)}` : ''
    return request(`/api/versements${q}`)
  },

  async getToutesSorties() {
    return request('/api/sorties')
  },

  async getSortiesEnAttenteSg() {
    return request('/api/sorties/en-attente-sg')
  },

  async getSortiesEnAttenteTr() {
    return request('/api/sorties/en-attente-tr')
  },

  /** @param {string} id */
  async accepterSortieSg(id) {
    return request(`/api/sorties/${id}/accepter-sg`, { method: 'POST' })
  },

  /** @param {string} id */
  async refuserSortieSg(id) {
    return request(`/api/sorties/${id}/refuser-sg`, { method: 'POST' })
  },

  /** @param {string} id */
  async accepterSortieTr(id) {
    return request(`/api/sorties/${id}/accepter-tr`, { method: 'POST' })
  },

  /** @param {string} id */
  async refuserSortieTr(id) {
    return request(`/api/sorties/${id}/refuser-tr`, { method: 'POST' })
  },

  async getTousPrets() {
    return request('/api/prets')
  },

  /** @param {string} pretId */
  async getRemboursementsPret(pretId) {
    return request(`/api/prets/${pretId}/remboursements`)
  },

  /**
   * Demande de remboursement d’un prêt (statut en_attente_tr).
   * @param {string} pretId
   * @param {number} montant
   */
  async demanderRemboursement(pretId, montant) {
    return request('/api/remboursements', {
      method: 'POST',
      body: JSON.stringify({ pretId, montant }),
    })
  },

  async getRemboursementsEnAttente() {
    return request('/api/remboursements/en-attente')
  },

  /** @param {string} id */
  async validerRemboursement(id) {
    return request(`/api/remboursements/${id}/valider`, { method: 'POST' })
  },

  /** @param {string} id */
  async refuserRemboursement(id) {
    return request(`/api/remboursements/${id}/refuser`, { method: 'POST' })
  },

  /**
   * @param {{ typeAide: string, montant: number }} payload
   */
  async createAideParametre(payload) {
    return request('/api/aides-parametres', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * @param {string} id
   * @param {{ typeAide: string, montant: number }} payload
   */
  async updateAideParametre(id, payload) {
    return request(`/api/aides-parametres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  /** @param {string} id */
  async deleteAideParametre(id) {
    return request(`/api/aides-parametres/${id}`, { method: 'DELETE' })
  },

  /** @param {string} pretId */
  async appliquerPenalitePret(pretId) {
    return request(`/api/prets/${pretId}/appliquer-penalite`, { method: 'POST' })
  },

  /** @param {string} id */
  async accepterVersement(id) {
    return request(`/api/versements/${id}/accepter`, { method: 'POST' })
  },

  /** @param {string} id */
  async refuserVersement(id) {
    return request(`/api/versements/${id}/refuser`, { method: 'POST' })
  },
}
