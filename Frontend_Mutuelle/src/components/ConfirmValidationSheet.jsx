import {
  formatMontantChiffres,
  montantEnLettres,
} from '../utils/nombreEnLettres'

/**
 * Bottom sheet / modal de confirmation avant validation financière.
 *
 * @param {{
 *   open: boolean,
 *   title?: string,
 *   lead?: string,
 *   montant: number|string,
 *   details?: Array<{ label: string, value: string }>,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   busy?: boolean,
 *   onConfirm: () => void | Promise<void>,
 *   onCancel: () => void,
 * }} props
 */
export default function ConfirmValidationSheet({
  open,
  title = 'Confirmer la validation',
  lead = 'Vérifiez le montant avant de confirmer.',
  montant,
  details = [],
  confirmLabel = 'Confirmer la validation',
  cancelLabel = 'Annuler',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const chiffres = formatMontantChiffres(montant)
  const lettres = montantEnLettres(montant)

  return (
    <div
      className="sheet-overlay"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel()
      }}
    >
      <div
        className="sheet-panel confirm-validation-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-validation-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header">
          <h2 id="confirm-validation-title">{title}</h2>
          <button
            type="button"
            className="sheet-close btn-touch"
            onClick={onCancel}
            disabled={busy}
            aria-label="Fermer"
          >
            ✕
          </button>
        </header>

        <div className="sheet-form">
          <p className="sheet-hint">{lead}</p>

          <div className="confirm-amount-block" aria-label="Montant à valider">
            <span className="confirm-amount-label">Montant</span>
            <p className="confirm-amount-chiffres">{chiffres}</p>
            <p className="confirm-amount-lettres">
              <span className="confirm-amount-lettres-label">En lettres</span>
              {lettres}
            </p>
          </div>

          {details.length > 0 ? (
            <dl className="confirm-details">
              {details.map((d) => (
                <div key={d.label} className="confirm-details-row">
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <button
            type="button"
            className="btn btn-accent btn-block btn-touch"
            disabled={busy}
            onClick={() => onConfirm()}
          >
            {busy ? 'Validation…' : confirmLabel}
          </button>
          <button
            type="button"
            className="btn btn-ghost-dark btn-block btn-touch"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
