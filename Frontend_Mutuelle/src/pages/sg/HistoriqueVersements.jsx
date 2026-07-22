import { useCallback, useEffect, useMemo, useState } from 'react'
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statutBadge(statut) {
  if (statut === 'accepte') return 'badge badge-success'
  if (statut === 'refuse') return 'badge badge-danger'
  return 'badge badge-warning'
}

function statutLabel(statut) {
  if (statut === 'accepte') return 'Validé'
  if (statut === 'refuse') return 'Refusé'
  if (statut === 'en_attente') return 'En attente'
  return statut || '—'
}

function membreName(membre) {
  if (!membre) return 'Membre inconnu'
  const name = [membre.prenom, membre.nom].filter(Boolean).join(' ')
  return name || membre.couriel || '—'
}

const META = {
  epargne: {
    eyebrow: 'Historique',
    title: 'Épargnes',
    empty: 'Aucun versement d’épargne enregistré.',
    searchPh: 'Rechercher membre…',
  },
  inscription: {
    eyebrow: 'Historique',
    title: 'Inscriptions',
    empty: 'Aucun versement d’inscription enregistré.',
    searchPh: 'Rechercher membre…',
  },
  solidarite: {
    eyebrow: 'Historique',
    title: 'Solidarités',
    empty: 'Aucun versement de solidarité enregistré.',
    searchPh: 'Rechercher membre…',
  },
}

/**
 * @param {{ raison: 'epargne' | 'inscription' | 'solidarite' }} props
 */
export default function SgHistoriqueVersements({ raison }) {
  const meta = META[raison] || META.epargne
  const [versements, setVersements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUS')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTousVersements(raison)
      const list = Array.isArray(data) ? data : []
      list.sort(
        (a, b) =>
          new Date(b.dateVersement || 0).getTime() -
          new Date(a.dateVersement || 0).getTime(),
      )
      setVersements(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [raison])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getTousVersements(raison)
        if (!alive) return
        const list = Array.isArray(data) ? data : []
        list.sort(
          (a, b) =>
            new Date(b.dateVersement || 0).getTime() -
            new Date(a.dateVersement || 0).getTime(),
        )
        setVersements(list)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [raison])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return versements.filter((v) => {
      if (statusFilter !== 'TOUS' && v.statut !== statusFilter) return false
      if (!q) return true
      const hay = [membreName(v.membre), v.membre?.couriel, v.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [versements, search, statusFilter])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">{meta.eyebrow}</p>
          <h1 className="sg-page-title">{meta.title}</h1>
        </div>
      </header>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          placeholder={meta.searchPh}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-chips" role="tablist">
          {[
            { id: 'TOUS', label: 'Tous' },
            { id: 'en_attente', label: 'En attente' },
            { id: 'accepte', label: 'Validés' },
            { id: 'refuse', label: 'Refusés' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-chip ${statusFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
          <button type="button" className="btn btn-primary btn-touch" onClick={load}>
            Réessayer
          </button>
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} versement${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">{meta.empty}</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((v) => (
            <li key={v.id} className="membre-card versement-card">
              <div className="membre-card-top">
                <div className="membre-avatar" aria-hidden="true">
                  {(membreName(v.membre)[0] || '?').toUpperCase()}
                </div>
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{membreName(v.membre)}</h2>
                  <p className="membre-card-mail">{v.membre?.couriel || '—'}</p>
                </div>
                <span className={statutBadge(v.statut)}>{statutLabel(v.statut)}</span>
              </div>
              <div className="versement-amount">{formatMoney(v.montant)}</div>
              <div className="membre-card-meta">
                <span>{formatDate(v.dateVersement)}</span>
                {v.description ? <span>{v.description}</span> : null}
                {raison === 'epargne' && v.membre ? (
                  <span>Épargne membre : {formatMoney(v.membre.epargne)}</span>
                ) : null}
                {raison === 'solidarite' && v.membre ? (
                  <span>
                    Dette solidarité : {formatMoney(v.membre.detteSolidarite)}
                  </span>
                ) : null}
                {raison === 'inscription' && v.membre ? (
                  <span>
                    Inscription {v.membre.inscriptionPayee ? 'soldée' : 'non soldée'}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
