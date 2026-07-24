import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'

const ETAT_FILTERS = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'a jour', label: 'À jour' },
  { id: 'non a jour', label: 'Non à jour' },
  { id: 'Inactif', label: 'Inactif' },
]

function etatBadgeClass(etat) {
  if (etat === 'a jour') return 'badge badge-success'
  if (etat === 'Inactif') return 'badge badge-danger'
  return 'badge badge-warning'
}

function etatLabel(etat) {
  if (etat === 'a jour') return 'À jour'
  if (etat === 'non a jour') return 'Non à jour'
  if (etat === 'Inactif') return 'Inactif'
  return etat || '—'
}

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function PresidentMembres() {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [etatFilter, setEtatFilter] = useState('TOUS')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getMembres()
      setMembres(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return membres.filter((m) => {
      if (etatFilter !== 'TOUS' && m.etat !== etatFilter) return false
      if (!q) return true
      return [m.nom, m.prenom, m.couriel, m.telephone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [membres, search, etatFilter])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Présidence</p>
          <h1 className="sg-page-title">Membres</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
        </button>
      </header>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          inputMode="search"
          placeholder="Rechercher nom, e-mail, téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un membre"
        />
        <div className="filter-chips" role="tablist" aria-label="Filtrer par état">
          {ETAT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={etatFilter === f.id}
              className={`filter-chip ${etatFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setEtatFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} membre${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun membre pour ces critères.</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((m) => (
            <li key={m.id} className="membre-card">
              <div className="membre-card-top">
                <div className="membre-avatar" aria-hidden="true">
                  {(m.prenom?.[0] || m.nom?.[0] || '?').toUpperCase()}
                </div>
                <div className="membre-card-info">
                  <h2 className="membre-card-name">
                    {[m.prenom, m.nom].filter(Boolean).join(' ')}
                  </h2>
                  <p className="membre-card-mail">{m.couriel}</p>
                </div>
                <span className={etatBadgeClass(m.etat)}>{etatLabel(m.etat)}</span>
              </div>
              <div className="membre-card-meta">
                <span>{m.telephone || '—'}</span>
                <span>
                  {m.inscriptionPayee ? 'Inscription OK' : 'Inscription due'}
                </span>
                <span>
                  {m.solidaritePayee ? 'Solidarité OK' : 'Solidarité due'}
                </span>
                <span>Épargne : {formatMoney(m.epargne)}</span>
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
