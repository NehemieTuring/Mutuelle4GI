import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function PresidentAccueil() {
  const [parametres, setParametres] = useState(null)
  const [prets, setPrets] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [params, allPrets, allMembres] = await Promise.all([
        api.getParametres(),
        api.getTousPrets(),
        api.getMembres(),
      ])
      setParametres(params)
      setPrets(Array.isArray(allPrets) ? allPrets : [])
      setMembres(Array.isArray(allMembres) ? allMembres : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const actifs = prets.filter((p) => p.statut === 'non rembourse')
    const echus = actifs.filter(
      (p) => p.dateEcheance && new Date(p.dateEcheance).getTime() <= now,
    )
    const aJour = membres.filter((m) => m.etat === 'a jour').length
    return {
      membres: membres.length,
      aJour,
      pretsActifs: actifs.length,
      pretsEchus: echus.length,
    }
  }, [prets, membres])

  const handleVerifier = async () => {
    setBusy(true)
    setToast('')
    setError('')
    try {
      await api.verifierEcheancesPrets()
      setToast('Vérification des échéances effectuée (notifications envoyées).')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vérification impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Présidence</p>
          <h1 className="sg-page-title">Vue d’ensemble</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
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

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <ul className="stats-grid">
        <li className="stat-tile">
          <span className="stat-tile-label">Membres</span>
          <p className="stat-tile-value">{loading ? '…' : stats.membres}</p>
        </li>
        <li className="stat-tile">
          <span className="stat-tile-label">À jour</span>
          <p className="stat-tile-value">{loading ? '…' : stats.aJour}</p>
        </li>
        <li className="stat-tile">
          <span className="stat-tile-label">Prêts actifs</span>
          <p className="stat-tile-value">{loading ? '…' : stats.pretsActifs}</p>
        </li>
        <li className="stat-tile">
          <span className="stat-tile-label">Prêts échus</span>
          <p className="stat-tile-value">{loading ? '…' : stats.pretsEchus}</p>
        </li>
      </ul>

      <h3 className="membre-dash-section-title">Caisses</h3>
      <CaissesOverview parametres={parametres} loading={loading} error="" />

      {parametres && !loading ? (
        <p className="sheet-hint" style={{ marginTop: 8 }}>
          Pénalité de retard : {formatMoney(parametres.montantPenaliteRetard)} —
          durée max. emprunt : {parametres.dureeMaximaleEmprunt} mois
        </p>
      ) : null}

      <div className="action-stack" style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn btn-accent btn-block btn-touch"
          disabled={busy}
          onClick={handleVerifier}
        >
          {busy ? 'Vérification…' : 'Vérifier les échéances de prêts'}
        </button>
      </div>
    </div>
  )
}
