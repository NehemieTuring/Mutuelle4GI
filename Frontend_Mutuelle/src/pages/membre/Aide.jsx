import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../../services/api'
import { getSession } from '../../services/auth'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statutLabel(s) {
  const map = {
    en_attente_secretaire_general: 'Attente SG',
    en_attente_tresorier: 'Attente trésorier',
    accepte_par_sg_accepte_par_tr: 'Acceptée',
    accepte_par_sg_refuse_par_tr: 'Refusée (TR)',
    refuse_par_sg_refuse_par_tr: 'Refusée',
    refuse_par_sg_accepte_par_tr: 'Refusée (SG)',
    recue_par_membre: 'Reçue',
  }
  return map[s] || s || '—'
}

export default function MembreAide() {
  const { refreshMembre } = useOutletContext() || {}
  const membreId = getSession()?.user?.id

  const [aides, setAides] = useState([])
  const [types, setTypes] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [typeAide, setTypeAide] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sheetError, setSheetError] = useState('')
  const [toast, setToast] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)

  const isEligible = eligibility?.eligible === true
  const eligibilityKnown = eligibility != null

  const load = async () => {
    if (!membreId) return
    setLoading(true)
    setError('')
    try {
      const [sorties, params, elig] = await Promise.all([
        api.getSortiesMembre(membreId),
        api.getAidesParametres(),
        api.getEligibleAide(membreId).catch(() => null),
      ])
      const list = (Array.isArray(sorties) ? sorties : []).filter((s) =>
        String(s.raison || '').startsWith('aide_'),
      )
      list.sort(
        (a, b) =>
          new Date(b.dateSortie || 0).getTime() - new Date(a.dateSortie || 0).getTime(),
      )
      setAides(list)
      setTypes(Array.isArray(params) ? params : [])
      setEligibility(elig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (sortieId) => {
    setConfirmingId(sortieId)
    setError('')
    try {
      await api.confirmerSortie(sortieId)
      setToast('Réception de l’aide confirmée.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation impossible')
    } finally {
      setConfirmingId(null)
    }
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!membreId) {
        setLoading(false)
        return
      }
      try {
        const [sorties, params, elig] = await Promise.all([
          api.getSortiesMembre(membreId),
          api.getAidesParametres(),
          api.getEligibleAide(membreId).catch(() => null),
        ])
        if (!alive) return
        const list = (Array.isArray(sorties) ? sorties : []).filter((s) =>
          String(s.raison || '').startsWith('aide_'),
        )
        list.sort(
          (a, b) =>
            new Date(b.dateSortie || 0).getTime() -
            new Date(a.dateSortie || 0).getTime(),
        )
        setAides(list)
        setTypes(Array.isArray(params) ? params : [])
        setEligibility(elig)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Chargement impossible')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [membreId])

  const selectedType = types.find((t) => t.typeAide === typeAide)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSheetError('')
    if (!typeAide) {
      setSheetError('Choisissez un type d’aide.')
      return
    }
    setSubmitting(true)
    try {
      await api.demanderAide(membreId, typeAide)
      setSheetOpen(false)
      setToast('Demande d’aide envoyée. En attente de validation.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Demande impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Solidarité</p>
          <h1 className="membre-dash-title">Aide</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch"
          onClick={() => {
            setSheetError('')
            setTypeAide(types[0]?.typeAide || '')
            setSheetOpen(true)
          }}
        >
          Demander
        </button>
      </header>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      <h3 className="membre-dash-section-title">Historique des aides</h3>

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : aides.length === 0 ? (
        <div className="sg-empty">Aucune demande d’aide pour le moment.</div>
      ) : (
        <ul className="membre-list">
          {aides.map((a) => {
            const canConfirm = a.statut === 'accepte_par_sg_accepte_par_tr'
            return (
              <li key={a.id} className="membre-card">
                <div className="membre-card-top">
                  <div className="membre-card-info">
                    <h2 className="membre-card-name">
                      {String(a.raison || '').replace(/^aide_/, '')}
                    </h2>
                    <p className="membre-card-mail">{formatDate(a.dateSortie)}</p>
                  </div>
                  <span className="badge badge-warning">{statutLabel(a.statut)}</span>
                </div>
                <div className="versement-amount">{formatMoney(a.montant)}</div>
                {canConfirm ? (
                  <button
                    type="button"
                    className="btn btn-accent btn-block btn-touch"
                    style={{ marginTop: 12 }}
                    disabled={confirmingId === a.id}
                    onClick={() => handleConfirm(a.id)}
                  >
                    {confirmingId === a.id
                      ? 'Confirmation…'
                      : 'Confirmer la réception'}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {sheetOpen ? (
        <div
          className="sheet-overlay"
          role="presentation"
          onClick={() => !submitting && setSheetOpen(false)}
        >
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <header className="sheet-header">
              <h2>
                {!eligibilityKnown
                  ? 'Aide'
                  : isEligible
                    ? 'Demander une aide'
                    : 'Aide non disponible'}
              </h2>
              <button
                type="button"
                className="sheet-close btn-touch"
                onClick={() => setSheetOpen(false)}
              >
                ✕
              </button>
            </header>
            {!eligibilityKnown ? (
              <div className="sheet-form">
                <p className="sheet-hint">Vérification de l’éligibilité…</p>
              </div>
            ) : !isEligible ? (
              <div className="sheet-form">
                <p className="sheet-hint" role="status">
                  Vous n’êtes pas éligible à demander une aide.
                </p>
                <div className="form-error form-error-light" role="alert">
                  {eligibility?.message ||
                    'Conditions non remplies (inscription et/ou solidarité).'}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-touch"
                  onClick={() => setSheetOpen(false)}
                >
                  Compris
                </button>
              </div>
            ) : (
              <form className="sheet-form" onSubmit={handleSubmit}>
                <p className="sheet-hint">
                  Inscription et solidarité doivent être à jour. Validation SG puis
                  trésorier.
                </p>
                <div className="form-group">
                  <label className="form-label form-label-dark" htmlFor="type-aide">
                    Type d’aide
                  </label>
                  <select
                    id="type-aide"
                    className="form-control form-control-light"
                    value={typeAide}
                    onChange={(e) => setTypeAide(e.target.value)}
                    required
                    disabled={submitting || types.length === 0}
                  >
                    {types.length === 0 ? (
                      <option value="">Aucun type disponible</option>
                    ) : (
                      types.map((t) => (
                        <option key={t.id} value={t.typeAide}>
                          {t.typeAide} — {formatMoney(t.montant)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {selectedType ? (
                  <p className="sheet-hint">
                    Montant de l’aide :{' '}
                    <strong>{formatMoney(selectedType.montant)}</strong>
                  </p>
                ) : null}
                {sheetError ? (
                  <div className="form-error form-error-light" role="alert">
                    {sheetError}
                  </div>
                ) : null}
                <button
                  type="submit"
                  className="btn btn-accent btn-block btn-touch"
                  disabled={submitting || !typeAide}
                >
                  {submitting ? 'Envoi…' : 'Soumettre la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
