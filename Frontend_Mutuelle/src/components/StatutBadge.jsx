import { getStatutMeta } from '../utils/statuts'

/**
 * Badge coloré selon le type d'objet et son état.
 * @param {{
 *   type: 'versement'|'sortie'|'remboursement'|'pret'|'membre'|'exercice',
 *   statut: string,
 *   echu?: boolean,
 *   className?: string,
 * }} props
 */
export default function StatutBadge({ type, statut, echu = false, className = '' }) {
  const meta = getStatutMeta(type, statut, { echu })
  return (
    <span className={`${meta.badge} ${className}`.trim()}>{meta.label}</span>
  )
}
