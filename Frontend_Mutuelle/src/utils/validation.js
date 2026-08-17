/** Utilitaires partagés (téléphone, montants, libellés membres). */

/** Nettoie un numéro (garde + et chiffres). */
export function normalizePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Numéro camerounais : mobile 6XXXXXXXX ou fixe Camtel 2XXXXXXXX
 * (avec préfixe optionnel +237 / 237).
 * @param {string} value
 */
export function isValidPhone(value) {
  const normalized = normalizePhone(value)
  return /^(?:\+?237)?[26]\d{8}$/.test(normalized)
}

export const PHONE_HINT =
  'Format attendu : 6XXXXXXXX (mobile) ou 2XXXXXXXX (Camtel), avec ou sans +237'

/** Épargne : minimum 500, pas de 25 (500, 525, 550…). */
export const EPARGNE_MIN = 500
export const EPARGNE_STEP = 25

/**
 * @param {number} value
 * @returns {string | null} message d’erreur ou null si OK
 */
export function validateEpargneAmount(value) {
  if (!Number.isFinite(value)) return 'Indiquez un montant valide.'
  if (value < EPARGNE_MIN) {
    return `Le montant minimum d’épargne est de ${EPARGNE_MIN} XAF.`
  }
  if ((value - EPARGNE_MIN) % EPARGNE_STEP !== 0) {
    return `Le montant doit évoluer par pas de ${EPARGNE_STEP} à partir de ${EPARGNE_MIN} (ex. 500, 525, 550…).`
  }
  return null
}

export function inscriptionLabel(payee) {
  return payee ? 'Inscription payée' : 'Inscription non payée'
}

export function solidariteLabel(payee) {
  return payee ? 'Solidarité soldée' : 'Solidarité non soldée'
}
