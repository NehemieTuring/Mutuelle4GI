import { useEffect, useMemo, useState } from 'react'
import { useMutuelleRefresh } from '../hooks/useMutuelleRefresh'
import { api } from '../services/api'

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

function membreName(membre) {
  if (!membre) return 'Membre inconnu'
  return [membre.prenom, membre.nom].filter(Boolean).join(' ') || membre.couriel || '—'
}

function labelRaison(raison) {
  const map = {
    inscription: 'Inscription',
    solidarite: 'Solidarité',
    epargne: 'Épargne',
    remboursement: 'Remboursement (versement)',
    pret: 'Prêt',
    retrait: 'Retrait',
    remb_pret: 'Remboursement de prêt',
  }
  if (map[raison]) return map[raison]
  if (String(raison || '').startsWith('aide_')) {
    return `Aide — ${String(raison).replace(/^aide_/, '')}`
  }
  return raison || 'Autre'
}

const TYPE_FILTERS = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'entrees', label: 'Entrées' },
  { id: 'sorties', label: 'Sorties' },
  { id: 'inscription', label: 'Inscription' },
  { id: 'solidarite', label: 'Solidarité' },
  { id: 'epargne', label: 'Épargne' },
  { id: 'remb_pret', label: 'Rembours. prêts' },
  { id: 'aide', label: 'Aides' },
  { id: 'pret', label: 'Prêts' },
  { id: 'retrait', label: 'Retraits' },
]

/**
 * Vue unifiée des entrées / sorties classées par raison.
 * @param {{ title?: string, eyebrow?: string }} props
 */
export default function FluxFinanciers({
  title = 'Flux financiers',
  eyebrow = 'Comptabilité',
}) {
  const [mouvements, setMouvements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('TOUS')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [versements, sorties, prets] = await Promise.all([
        api.getTousVersements(),
        api.getToutesSorties(),
        api.getTousPrets(),
      ])

      const remboursementsNested = await Promise.all(
        (Array.isArray(prets) ? prets : []).map(async (p) => {
          try {
            const list = await api.getRemboursementsPret(p.id)
            return (Array.isArray(list) ? list : []).map((r) => ({
              ...r,
              pret: p,
              membre: p.membre,
            }))
          } catch {
            return []
          }
        }),
      )

      const entrees = (Array.isArray(versements) ? versements : []).map((v) => ({
        id: `v-${v.id}`,
        sens: 'entree',
        raison: v.raison || 'autre',
        typeKey: v.raison || 'autre',
        montant: v.montant,
        date: v.dateVersement,
        statut: v.statut,
        membre: v.membre,
        source: 'versement',
      }))

      const rembs = remboursementsNested.flat().map((r) => ({
        id: `r-${r.id}`,
        sens: 'entree',
        raison: 'remb_pret',
        typeKey: 'remb_pret',
        montant: r.montant,
        date: r.dateRemboursement,
        statut: r.statut,
        membre: r.membre || r.pret?.membre,
        source: 'remboursement',
      }))

      const sortiesMapped = (Array.isArray(sorties) ? sorties : []).map((s) => {
        const raison = s.raison || 'autre'
        let typeKey = raison
        if (raison.startsWith('aide_')) typeKey = 'aide'
        return {
          id: `s-${s.id}`,
          sens: 'sortie',
          raison,
          typeKey,
          montant: s.montant,
          date: s.dateSortie,
          statut: s.statut,
          membre: s.membre,
          source: 'sortie',
        }
      })

      const all = [...entrees, ...rembs, ...sortiesMapped]
      all.sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      )
      setMouvements(all)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useMutuelleRefresh(load, null)


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mouvements.filter((m) => {
      if (typeFilter === 'entrees' && m.sens !== 'entree') return false
      if (typeFilter === 'sorties' && m.sens !== 'sortie') return false
      if (
        typeFilter !== 'TOUS' &&
        typeFilter !== 'entrees' &&
        typeFilter !== 'sorties' &&
        m.typeKey !== typeFilter
      ) {
        return false
      }
      if (!q) return true
      const hay = [membreName(m.membre), m.membre?.couriel, labelRaison(m.raison), m.statut]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [mouvements, typeFilter, search])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const m of filtered) {
      const key = m.typeKey
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(m)
    }
    return [...map.entries()].sort((a, b) =>
      labelRaison(a[0]).localeCompare(labelRaison(b[0]), 'fr'),
    )
  }, [filtered])

  const totaux = useMemo(() => {
    let entrees = 0
    let sorties = 0
    for (const m of filtered) {
      const n = Number(m.montant) || 0
      if (m.sens === 'entree') entrees += n
      else sorties += n
    }
    return { entrees, sorties }
  }, [filtered])

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">{eyebrow}</p>
          <h1 className="sg-page-title">{title}</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={load}>
          Actualiser
        </button>
      </header>

      <p className="sheet-hint" style={{ marginBottom: 12 }}>
        Toutes les entrées et sorties, classées par type (raison), avec le membre
        et la date concernés.
      </p>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          inputMode="search"
          placeholder="Rechercher membre, type, statut…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un mouvement"
        />
        <div className="filter-chips filter-chips-wrap" role="tablist" aria-label="Type">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={typeFilter === f.id}
              className={`filter-chip ${typeFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setTypeFilter(f.id)}
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

      {!loading && !error ? (
        <ul className="stats-grid" style={{ marginBottom: 20 }}>
          <li className="stat-tile">
            <span className="stat-tile-label">Total entrées (filtre)</span>
            <p className="stat-tile-value">{formatMoney(totaux.entrees)}</p>
          </li>
          <li className="stat-tile">
            <span className="stat-tile-label">Total sorties (filtre)</span>
            <p className="stat-tile-value">{formatMoney(totaux.sorties)}</p>
          </li>
        </ul>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} mouvement(s) — ${grouped.length} type(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement des flux…</div>
      ) : grouped.length === 0 ? (
        <div className="sg-empty">Aucun mouvement pour ces critères.</div>
      ) : (
        grouped.map(([typeKey, items]) => (
          <section key={typeKey} className="flux-group">
            <header className="flux-group-header">
              <h2 className="flux-group-title">{labelRaison(typeKey)}</h2>
              <span className="flux-group-count">
                {items.length} ·{' '}
                {formatMoney(
                  items.reduce((s, m) => s + (Number(m.montant) || 0), 0),
                )}
              </span>
            </header>
            <ul className="membre-list">
              {items.map((m) => (
                <li key={m.id} className="membre-card">
                  <div className="membre-card-top">
                    <div className="membre-card-info">
                      <h3 className="membre-card-name">{membreName(m.membre)}</h3>
                      <p className="membre-card-mail">
                        {formatDate(m.date)}
                        {m.membre?.couriel ? ` · ${m.membre.couriel}` : ''}
                      </p>
                    </div>
                    <span
                      className={
                        m.sens === 'entree' ? 'badge badge-success' : 'badge badge-warning'
                      }
                    >
                      {m.sens === 'entree' ? 'Entrée' : 'Sortie'}
                    </span>
                  </div>
                  <div className="versement-amount">{formatMoney(m.montant)}</div>
                  <div className="membre-card-meta">
                    <span>{labelRaison(m.raison)}</span>
                    <span>{m.statut || '—'}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
