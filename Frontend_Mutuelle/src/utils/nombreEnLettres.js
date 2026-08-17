/**
 * Convertit un montant en lettres (français, francs CFA).
 * Ex. 50000 → « cinquante mille francs CFA »
 */

const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
]

const TENS = [
  '',
  '',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
]

function belowHundred(n) {
  if (n < 20) return UNITS[n]
  const t = Math.floor(n / 10)
  const u = n % 10
  if (t === 7 || t === 9) {
    const base = t === 7 ? 'soixante' : 'quatre-vingt'
    const rest = n - (t === 7 ? 60 : 80)
    if (rest === 0) return t === 7 ? 'soixante' : 'quatre-vingts'
    const sep = rest === 1 && t === 7 ? ' et ' : '-'
    return `${base}${sep}${UNITS[rest]}`
  }
  if (u === 0) return t === 8 ? 'quatre-vingts' : TENS[t]
  const sep = u === 1 && t !== 8 ? ' et ' : '-'
  return `${TENS[t]}${sep}${UNITS[u]}`
}

function belowThousand(n) {
  if (n < 100) return belowHundred(n)
  const h = Math.floor(n / 100)
  const rest = n % 100
  let head = h === 1 ? 'cent' : `${UNITS[h]} cent`
  if (rest === 0 && h > 1) head += 's'
  if (rest === 0) return head
  return `${head} ${belowHundred(rest)}`
}

function chunkToWords(n, singular, plural) {
  if (n === 0) return ''
  if (n === 1) return singular === 'mille' ? 'mille' : `un ${singular}`
  return `${belowThousand(n)} ${plural}`
}

/**
 * @param {number|string|null|undefined} amount
 * @returns {string}
 */
export function montantEnLettres(amount) {
  const n = Math.round(Number(amount) || 0)
  if (n < 0) return `moins ${montantEnLettres(-n)}`
  if (n === 0) return 'zéro franc CFA'

  const milliards = Math.floor(n / 1_000_000_000)
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000)
  const milliers = Math.floor((n % 1_000_000) / 1000)
  const reste = n % 1000

  const parts = []
  if (milliards) {
    parts.push(chunkToWords(milliards, 'milliard', 'milliards'))
  }
  if (millions) {
    parts.push(chunkToWords(millions, 'million', 'millions'))
  }
  if (milliers) {
    parts.push(chunkToWords(milliers, 'mille', 'mille'))
  }
  if (reste) {
    parts.push(belowThousand(reste))
  }

  const texte = parts.filter(Boolean).join(' ')
  const unite = n > 1 ? 'francs CFA' : 'franc CFA'
  return `${texte} ${unite}`
}

/**
 * @param {number|string|null|undefined} amount
 * @returns {string} ex. « 50 000 XAF »
 */
export function formatMontantChiffres(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}
