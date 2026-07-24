import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

export default function SgCaisses() {
  const [parametres, setParametres] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setParametres(await api.getParametres())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Trésorerie</p>
          <h1 className="sg-page-title">État des caisses</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
        </button>
      </header>
      <CaissesOverview parametres={parametres} loading={loading} error={error} />
    </div>
  )
}
