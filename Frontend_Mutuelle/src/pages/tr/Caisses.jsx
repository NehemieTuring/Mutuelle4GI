import { useEffect, useState } from 'react'
import { useMutuelleRefresh } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function TrCaisses() {
  const [parametres, setParametres] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getParametres()
      setParametres(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useMutuelleRefresh(load, null)


  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Trésorerie</p>
          <h1 className="sg-page-title">Caisses</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
        </button>
      </header>

      <p className="sheet-hint" style={{ marginBottom: 16 }}>
        Soldes en temps réel. Les validations de versements et sorties mettent à
        jour ces montants.
      </p>

      <CaissesOverview parametres={parametres} loading={loading} error={error} />

      {parametres && !loading ? (
        <div className="params-readonly" style={{ marginTop: 24 }}>
          <h3 className="membre-dash-section-title">Références</h3>
          <ul className="membre-list">
            <li className="membre-card">
              <div className="membre-card-meta">
                <span>
                  Renflouement inscription :{' '}
                  {formatMoney(parametres.montantRenflouementInscription)}
                </span>
                <span>Inscription (réf.) : {formatMoney(parametres.montantInscription)}</span>
                <span>Solidarité : {formatMoney(parametres.montantSolidarite)}</span>
                <span>
                  Pénalité retard : {formatMoney(parametres.montantPenaliteRetard)}
                </span>
              </div>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
