import { useEffect, useState } from 'react'
import { useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { useLocation, useOutletContext } from 'react-router-dom'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'
import { getSession } from '../../services/auth'
import {
  EPARGNE_MIN,
  EPARGNE_STEP,
  validateEpargneAmount,
} from '../../utils/validation'

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
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MembreEpargne() {
  const location = useLocation()
  const { membre: ctxMembre, setMembre: setCtxMembre, refreshMembre, exerciceActif } =
    useOutletContext() || {}
  const session = getSession()
  const membreId = session?.user?.id

  const [membre, setMembre] = useState(ctxMembre || session?.user)
  const [solde, setSolde] = useState(null)
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(Boolean(location.state?.openEpargne))
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sheetError, setSheetError] = useState('')
  const [toast, setToast] = useState('')

  const epargne = solde?.epargne ?? membre?.epargne ?? 0
  const interet = solde?.interet ?? membre?.interet ?? 0
  const soldeTotal = solde?.soldeTotal ?? Number(epargne) + Number(interet)

  const load = async () => {
    if (!membreId) return
    setLoading(true)
    setError('')
    try {
      const [fresh, list, soldeTotalRes] = await Promise.all([
        api.getMembre(membreId),
        api.getVersementsMembre(membreId, 'epargne'),
        api.getSoldeTotal(membreId).catch(() => null),
      ])
      setMembre(fresh)
      setCtxMembre?.(fresh)
      setSolde(soldeTotalRes)
      setHistorique(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [membreId, setCtxMembre])

  useMutuelleRefreshListener(load, ['membres', 'versements'])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setSheetError('')
    const value = Number(amount)
    const amountError = validateEpargneAmount(value)
    if (amountError) {
      setSheetError(amountError)
      return
    }
    setSubmitting(true)
    try {
      await api.demanderEpargne(membreId, value)
      setSheetOpen(false)
      setAmount('')
      setToast('Demande d’épargne envoyée. En attente du trésorier.')
      await load()
      await refreshMembre?.()
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Épargne impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Mon compte</p>
          <h1 className="membre-dash-title">Épargne</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch"
          disabled={!exerciceActif}
          onClick={() => {
            setSheetError('')
            setAmount('')
            setSheetOpen(true)
          }}
        >
          {exerciceActif ? 'Épargner' : 'Exercice non ouvert'}
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
        <span className="membre-summary-label">Solde total</span>
        <p className="membre-summary-value">{formatMoney(soldeTotal)}</p>
        <p className="membre-dash-muted">Épargne + intérêts cumulés</p>
      </div>

      <ul className="membre-dash-list" style={{ marginBottom: 20 }}>
        <li className="membre-dash-item">
          <div>
            <p className="membre-dash-item-label">Épargne</p>
            <p className="membre-dash-item-hint">Capital placé</p>
          </div>
          <p className="membre-dash-item-value">{formatMoney(epargne)}</p>
        </li>
        <li className="membre-dash-item">
          <div>
            <p className="membre-dash-item-label">Intérêts cumulés</p>
            <p className="membre-dash-item-hint">Part des intérêts d’emprunts liés à votre épargne</p>
          </div>
          <p className="membre-dash-item-value">{formatMoney(interet)}</p>
        </li>
      </ul>

      <h3 className="membre-dash-section-title">Historique</h3>

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : historique.length === 0 ? (
        <div className="sg-empty">Aucun versement d’épargne pour le moment.</div>
      ) : (
        <ul className="membre-list">
          {historique.map((v) => (
            <li key={v.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{formatMoney(v.montant)}</h2>
                  <p className="membre-card-mail">{formatDate(v.dateVersement)}</p>
                </div>
                <StatutBadge type="versement" statut={v.statut} />
              </div>
              {v.description ? (
                <div className="membre-card-meta">
                  <span>{v.description}</span>
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
              <h2>Épargner</h2>
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
                Minimum {EPARGNE_MIN} XAF, par pas de {EPARGNE_STEP} (ex. 500, 525,
                550…). Crédité après validation du trésorier.
              </p>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="ep-montant">
                  Montant (XAF)
                </label>
                <input
                  id="ep-montant"
                  className="form-control form-control-light"
                  type="number"
                  inputMode="numeric"
                  min={EPARGNE_MIN}
                  step={EPARGNE_STEP}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder={String(EPARGNE_MIN)}
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
                disabled={submitting || !exerciceActif}
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
