import { useCallback, useEffect, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

export default function CommissaireAccueil() {
  const [parametres, setParametres] = useState(null)
  const [counts, setCounts] = useState({ versements: 0, sorties: 0, prets: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [params, versements, sorties, prets] = await Promise.all([
        api.getParametres(),
        api.getTousVersements(),
        api.getToutesSorties(),
        api.getTousPrets(),
      ])
      setParametres(params)
      setCounts({
        versements: Array.isArray(versements) ? versements.length : 0,
        sorties: Array.isArray(sorties) ? sorties.length : 0,
        prets: Array.isArray(prets) ? prets.length : 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [])

  useMutuelleRefresh(load, null)

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Contrôle</p>
          <h1 className="sg-page-title">Vue d’ensemble</h1>
        </div>
      </header>

      <p className="sheet-hint" style={{ marginBottom: 16 }}>
        Consultation des caisses et des flux financiers (entrées / sorties par
        type).
      </p>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <ul className="stats-grid">
        <li className="stat-tile">
          <span className="stat-tile-label">Versements</span>
          <p className="stat-tile-value">{loading ? '…' : counts.versements}</p>
        </li>
        <li className="stat-tile">
          <span className="stat-tile-label">Sorties</span>
          <p className="stat-tile-value">{loading ? '…' : counts.sorties}</p>
        </li>
        <li className="stat-tile">
          <span className="stat-tile-label">Emprunts</span>
          <p className="stat-tile-value">{loading ? '…' : counts.prets}</p>
        </li>
      </ul>

      <h3 className="membre-dash-section-title">État des caisses</h3>
      <CaissesOverview parametres={parametres} loading={loading} error="" />

      <div className="action-stack" style={{ marginTop: 24 }}>
        <Link to="/commissaire/flux" className="btn btn-accent btn-block btn-touch">
          Voir tous les flux financiers
        </Link>
      </div>
    </div>
  )
}
