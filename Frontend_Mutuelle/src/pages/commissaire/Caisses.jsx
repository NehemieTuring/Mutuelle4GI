import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import CaissesOverview from '../../components/CaissesOverview'

export default function CommissaireCaisses() {
  const [parametres, setParametres] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.getParametres()
        if (!alive) return
        setParametres(data)
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
  }, [])

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
