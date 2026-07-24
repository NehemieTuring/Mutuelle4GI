import { useEffect, useMemo, useState } from 'react'
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

export default function CommissaireVersements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [raison, setRaison] = useState('TOUS')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.getTousVersements()
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

  const filtered = useMemo(() => {
    if (raison === 'TOUS') return items
    return items.filter((v) => v.raison === raison)
  }, [items, raison])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Contrôle</p>
          <h1 className="sg-page-title">Versements</h1>
        </div>
      </header>

      <div className="filter-chips" role="tablist">
        {[
          { id: 'TOUS', label: 'Tous' },
          { id: 'inscription', label: 'Inscription' },
          { id: 'solidarite', label: 'Solidarité' },
          { id: 'epargne', label: 'Épargne' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-chip ${raison === f.id ? 'is-active' : ''}`}
            onClick={() => setRaison(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading ? 'Chargement…' : `${filtered.length} versement(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun versement.</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((v) => (
            <li key={v.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{membreName(v.membre)}</h2>
                  <p className="membre-card-mail">
                    {v.raison} — {formatDate(v.dateVersement)}
                  </p>
                </div>
                <span
                  className={
                    v.statut === 'accepte'
                      ? 'badge badge-success'
                      : v.statut === 'refuse'
                        ? 'badge badge-danger'
                        : 'badge badge-warning'
                  }
                >
                  {v.statut}
                </span>
              </div>
              <div className="versement-amount">{formatMoney(v.montant)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
