/**
 * Convertit un montant entier en lettres (français, FCFA).
 * Ex. 50000 → « cinquante mille »
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
    if (rest === 0) return t === 9 ? 'quatre-vingts' : base
    const sep = rest === 1 && t === 7 ? ' et ' : '-'
    return `${base}${sep}${belowHundred(rest)}`
  }
  if (t === 8) {
    if (u === 0) return 'quatre-vingts'
    return `quatre-vingt-${UNITS[u]}`
  }
  if (u === 0) return TENS[t]
  if (u === 1) return `${TENS[t]} et un`
  return `${TENS[t]}-${UNITS[u]}`
}

function belowThousand(n) {
  if (n < 100) return belowHundred(n)
  const h = Math.floor(n / 100)
  const rest = n % 100
  const hundreds =
    h === 1 ? 'cent' : rest === 0 ? `${UNITS[h]} cents` : `${UNITS[h]} cent`
  if (rest === 0) return hundreds
  return `${h === 1 ? 'cent' : `${UNITS[h]} cent`} ${belowHundred(rest)}`
}

function chunkToWords(n) {
  if (n === 0) return ''
  if (n < 1000) return belowThousand(n)
  return ''
}

/**
 * @param {number|string|null|undefined} amount
 * @returns {string}
 */
export function montantEnLettres(amount) {
  const n = Math.round(Number(amount) || 0)
  if (n < 0) return `moins ${montantEnLettres(-n)}`
  if (n === 0) return 'zéro'

  const parts = []
  const milliards = Math.floor(n / 1_000_000_000)
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000)
  const milliers = Math.floor((n % 1_000_000) / 1000)
  const reste = n % 1000

  if (milliards > 0) {
    parts.push(
      milliards === 1
        ? 'un milliard'
        : `${belowThousand(milliards)} milliards`,
    )
  }
  if (millions > 0) {
    parts.push(
      millions === 1 ? 'un million' : `${belowThousand(millions)} millions`,
    )
  }
  if (milliers > 0) {
    parts.push(milliers === 1 ? 'mille' : `${belowThousand(milliers)} mille`)
  }
  if (reste > 0) {
    parts.push(belowThousand(reste))
  }

  return parts.join(' ')
}

/**
 * @param {number|string|null|undefined} amount
 * @returns {string} ex. « cinquante mille francs CFA »
 */
export function montantEnLettresFcfa(amount) {
  const words = montantEnLettres(amount)
  return `${words} francs CFA`
}
