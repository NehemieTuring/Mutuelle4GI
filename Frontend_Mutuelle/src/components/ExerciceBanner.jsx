import { Link } from 'react-router-dom'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Bannière affichée quand aucun exercice n'est ouvert.
 * @param {{ exercice: object|null, loading?: boolean, sgLink?: string, className?: string }} props
 */
export default function ExerciceBanner({
  exercice,
  loading = false,
  sgLink = '/sg/exercices',
  className = '',
}) {
  if (loading || exercice) return null

  return (
    <div className={`exercice-banner ${className}`.trim()} role="alert">
      <p className="exercice-banner-title">Aucun exercice en cours</p>
      <p className="exercice-banner-text">
        Les opérations financières (versements, sorties, remboursements) sont
        suspendues tant qu’un exercice n’est pas ouvert par le secrétaire général.
      </p>
      {sgLink ? (
        <Link to={sgLink} className="exercice-banner-link btn-touch">
          Gérer les exercices
        </Link>
      ) : null}
    </div>
  )
}

/**
 * Bandeau compact indiquant l'exercice actif (bureau).
 */
export function ExerciceStatusChip({ exercice, loading }) {
  if (loading) {
    return (
      <div className="exercice-status-chip exercice-status-chip-muted" role="status">
        Exercice…
      </div>
    )
  }

  if (!exercice) {
    return (
      <div className="exercice-status-chip exercice-status-chip-warn" role="status">
        Aucun exercice ouvert
      </div>
    )
  }

  return (
    <div className="exercice-status-chip exercice-status-chip-ok" role="status">
      Exercice en cours — ouvert le {formatDate(exercice.dateOuverture)}
    </div>
  )
}
