import { useEffect, useState } from 'react'
import { api } from '../../services/api'

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

function membreName(membre) {
  if (!membre) return '—'
  return [membre.prenom, membre.nom].filter(Boolean).join(' ') || membre.couriel || '—'
}

export default function CommissaireSorties() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.getToutesSorties()
        if (!alive) return
        setItems(Array.isArray(data) ? data : [])
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
          <h1 className="sg-page-title">Sorties</h1>
        </div>
      </header>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading ? 'Chargement…' : `${items.length} sortie(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="sg-empty">Aucune sortie.</div>
      ) : (
        <ul className="membre-list">
          {items.map((s) => (
            <li key={s.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{membreName(s.membre)}</h2>
                  <p className="membre-card-mail">
                    {s.raison} — {formatDate(s.dateSortie)}
                  </p>
                </div>
                <span className="badge badge-warning">{s.statut}</span>
              </div>
              <div className="versement-amount">{formatMoney(s.montant)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
