import {
  inscriptionLabel,
  solidariteLabel,
} from '../utils/validation'
import StatutBadge from './StatutBadge'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

/**
 * Carte membre unifiée (listes bureau).
 * @param {{
 *   membre: object,
 *   showFinances?: boolean,
 *   onEdit?: (m: object) => void,
 * }} props
 */
export default function MembreCard({ membre: m, showFinances = true, onEdit }) {
  const name = [m.prenom, m.nom].filter(Boolean).join(' ') || '—'

  return (
    <li className="membre-card">
      <div className="membre-card-top">
        <div className="membre-avatar" aria-hidden="true">
          {(m.prenom?.[0] || m.nom?.[0] || '?').toUpperCase()}
        </div>
        <div className="membre-card-info">
          <h2 className="membre-card-name">{name}</h2>
          <p className="membre-card-mail">{m.couriel}</p>
          <p className="membre-card-phone">{m.telephone || '—'}</p>
        </div>
        <StatutBadge type="membre" statut={m.etat} />
      </div>

      <div className="membre-status-chips" aria-label="Statut cotisations">
        <span
          className={
            m.inscriptionPayee ? 'status-chip status-chip-ok' : 'status-chip status-chip-alert'
          }
        >
          {inscriptionLabel(m.inscriptionPayee)}
        </span>
        <span
          className={
            m.solidaritePayee ? 'status-chip status-chip-ok' : 'status-chip status-chip-alert'
          }
        >
          {solidariteLabel(m.solidaritePayee)}
        </span>
      </div>

      {showFinances ? (
        <div className="membre-card-meta membre-card-finances">
          <span>Épargne {formatMoney(m.epargne)}</span>
          <span>Intérêts {formatMoney(m.interet)}</span>
          <span>Dette prêt {formatMoney(m.dette)}</span>
          <span>Dette solidarité {formatMoney(m.detteSolidarite)}</span>
        </div>
      ) : null}

      {onEdit ? (
        <button
          type="button"
          className="btn btn-primary btn-block btn-touch"
          style={{ marginTop: 12 }}
          onClick={() => onEdit(m)}
        >
          Modifier
        </button>
      ) : null}
    </li>
  )
}
