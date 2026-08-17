import { useCallback, useEffect, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

export default function CommissaireCaisses() {
  const [parametres, setParametres] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const load = useCallback(async () => {
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
  }, [])

  useMutuelleRefresh(load, null)

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Contrôle</p>
          <h1 className="sg-page-title">Caisses</h1>
        </div>
      </header>
      <CaissesOverview parametres={parametres} loading={loading} error={error} />
    </div>
  )
}
