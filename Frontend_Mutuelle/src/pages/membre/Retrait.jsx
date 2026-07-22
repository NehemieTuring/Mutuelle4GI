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
    accepte_par_sg_accepte_par_tr: 'À confirmer',
    accepte_par_sg_refuse_par_tr: 'Refusé (TR)',
    refuse_par_sg_refuse_par_tr: 'Refusé',
    refuse_par_sg_accepte_par_tr: 'Refusé (SG)',
    recue_par_membre: 'Reçu',
  }
  return map[s] || s || '—'
}

function statutClass(s) {
  if (s === 'recue_par_membre' || s === 'accepte_par_sg_accepte_par_tr') {
    return 'badge badge-success'
  }
  if (
    s === 'refuse_par_sg_refuse_par_tr' ||
    s === 'accepte_par_sg_refuse_par_tr' ||
    s === 'refuse_par_sg_accepte_par_tr'
  ) {
    return 'badge badge-danger'
  }
  return 'badge badge-warning'
}

export default function MembreRetrait() {
  const { membre: ctxMembre, setMembre: setCtxMembre, refreshMembre } =
    useOutletContext() || {}
  const membreId = getSession()?.user?.id

  const [membre, setMembre] = useState(ctxMembre || getSession()?.user)
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [sheetError, setSheetError] = useState('')
  const [toast, setToast] = useState('')

  const epargneDispo = Number(membre?.epargne || 0)

  const load = async () => {
    if (!membreId) return
    setLoading(true)
    setError('')
    try {
      const [fresh, sorties] = await Promise.all([
        api.getMembre(membreId),
        api.getSortiesMembre(membreId),
      ])
      setMembre(fresh)
      setCtxMembre?.(fresh)
      const list = (Array.isArray(sorties) ? sorties : []).filter(
        (s) => s.raison === 'retrait',
      )
      list.sort(
        (a, b) =>
          new Date(b.dateSortie || 0).getTime() -
          new Date(a.dateSortie || 0).getTime(),
      )
      setHistorique(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
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
        const [fresh, sorties] = await Promise.all([
          api.getMembre(membreId),
          api.getSortiesMembre(membreId),
        ])
        if (!alive) return
        setMembre(fresh)
        setCtxMembre?.(fresh)
        const list = (Array.isArray(sorties) ? sorties : []).filter(
          (s) => s.raison === 'retrait',
        )
        list.sort(
          (a, b) =>
            new Date(b.dateSortie || 0).getTime() -
            new Date(a.dateSortie || 0).getTime(),
        )
        setHistorique(list)
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
  }, [membreId, setCtxMembre])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSheetError('')
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setSheetError('Indiquez un montant valide supérieur à 0.')
      return
    }
    if (value > epargneDispo) {
      setSheetError(
        `Le montant dépasse votre épargne disponible (${formatMoney(epargneDispo)}).`,
      )
      return
    }
    setSubmitting(true)
    try {
      await api.demanderRetrait(membreId, value)
      setSheetOpen(false)
      setAmount('')
      setToast('Demande de retrait envoyée. En attente de validation.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Retrait impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async (sortieId) => {
    setConfirmingId(sortieId)
    setError('')
    try {
      await api.confirmerSortie(sortieId)
      setToast('Retrait confirmé. Votre épargne a été mise à jour.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation impossible')
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Mon compte</p>
          <h1 className="membre-dash-title">Retrait</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch"
          onClick={() => {
            setSheetError('')
            setAmount('')
            setSheetOpen(true)
          }}
          disabled={epargneDispo <= 0}
        >
          Effectuer un retrait
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

      <div className="membre-summary-block">
        <span className="membre-summary-label">Épargne disponible</span>
        <p className="membre-summary-value">{formatMoney(epargneDispo)}</p>
        <p className="membre-dash-muted">
          Intérêts : {formatMoney(membre?.interet)} — un retrait réduit aussi les
          intérêts au prorata.
        </p>
      </div>

      {epargneDispo <= 0 ? (
        <div className="membre-info-banner" role="status">
          Aucune épargne disponible pour un retrait.
        </div>
      ) : null}

      <h3 className="membre-dash-section-title">Historique</h3>

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : historique.length === 0 ? (
        <div className="sg-empty">Aucun retrait pour le moment.</div>
      ) : (
        <ul className="membre-list">
          {historique.map((s) => (
            <li key={s.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{formatMoney(s.montant)}</h2>
                  <p className="membre-card-mail">{formatDate(s.dateSortie)}</p>
                </div>
                <span className={statutClass(s.statut)}>
                  {statutLabel(s.statut)}
                </span>
              </div>
              {s.statut === 'accepte_par_sg_accepte_par_tr' ? (
                <div className="membre-card-meta">
                  <button
                    type="button"
                    className="btn btn-accent btn-touch"
                    disabled={confirmingId === s.id}
                    onClick={() => handleConfirm(s.id)}
                  >
                    {confirmingId === s.id ? 'Confirmation…' : 'Confirmer réception'}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
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
              <h2>Effectuer un retrait</h2>
              <button
                type="button"
                className="sheet-close btn-touch"
                onClick={() => setSheetOpen(false)}
              >
                ✕
              </button>
            </header>
            <form className="sheet-form" onSubmit={handleSubmit}>
              <p className="sheet-hint">
                Maximum : <strong>{formatMoney(epargneDispo)}</strong>. Validation
                SG puis trésorier, puis confirmation de réception.
              </p>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="ret-montant">
                  Montant (XAF)
                </label>
                <input
                  id="ret-montant"
                  className="form-control form-control-light"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={epargneDispo}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              {sheetError ? (
                <div className="form-error form-error-light" role="alert">
                  {sheetError}
                </div>
              ) : null}
              <button
                type="submit"
                className="btn btn-accent btn-block btn-touch"
                disabled={submitting || epargneDispo <= 0}
              >
                {submitting ? 'Envoi…' : 'Confirmer'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
