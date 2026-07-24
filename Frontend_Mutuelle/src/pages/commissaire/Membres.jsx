import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'

function etatBadgeClass(etat) {
  if (etat === 'a jour') return 'badge badge-success'
  if (etat === 'Inactif') return 'badge badge-danger'
  return 'badge badge-warning'
}

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function CommissaireMembres() {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.getMembres()
        if (!alive) return
        setMembres(Array.isArray(data) ? data : [])
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
    const q = search.trim().toLowerCase()
    if (!q) return membres
    return membres.filter((m) =>
      [m.nom, m.prenom, m.couriel, m.telephone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [membres, search])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Contrôle</p>
          <h1 className="sg-page-title">Membres</h1>
        </div>
      </header>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          inputMode="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un membre"
        />
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading ? 'Chargement…' : `${filtered.length} membre(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun membre.</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((m) => (
            <li key={m.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-card-info">
                  <h2 className="membre-card-name">
                    {[m.prenom, m.nom].filter(Boolean).join(' ')}
                  </h2>
                  <p className="membre-card-mail">{m.couriel}</p>
                </div>
                <span className={etatBadgeClass(m.etat)}>{m.etat || '—'}</span>
              </div>
              <div className="membre-card-meta">
                <span>Épargne : {formatMoney(m.epargne)}</span>
                <span>Intérêts : {formatMoney(m.interet)}</span>
                <span>Dette prêt : {formatMoney(m.dette)}</span>
                <span>Sol. due : {formatMoney(m.detteSolidarite)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
