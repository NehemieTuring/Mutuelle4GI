import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'

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
  if (!membre) return 'Membre inconnu'
  const name = [membre.prenom, membre.nom].filter(Boolean).join(' ')
  return name || membre.couriel || '—'
}

export default function SgEmprunts() {
  const [prets, setPrets] = useState([])
  const [remboursementsByPret, setRemboursementsByPret] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUS')
  const [penaliteId, setPenaliteId] = useState(null)
  const [actionMsg, setActionMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTousPrets()
      setPrets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  const [nowMs] = useState(() => Date.now())

  useMutuelleRefresh(load, 'prets')


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return prets.filter((p) => {
      if (statusFilter === 'rembourse' && p.statut !== 'rembourse') return false
      if (statusFilter === 'non rembourse' && p.statut !== 'non rembourse') return false
      if (!q) return true
      const hay = [membreName(p.membre), p.membre?.couriel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [prets, search, statusFilter])

  const toggleExpand = async (pretId) => {
    if (expandedId === pretId) {
      setExpandedId(null)
      return
    }
    setExpandedId(pretId)
    if (remboursementsByPret[pretId]) return
    try {
      const list = await api.getRemboursementsPret(pretId)
      setRemboursementsByPret((prev) => ({
        ...prev,
        [pretId]: Array.isArray(list) ? list : [],
      }))
    } catch {
      setRemboursementsByPret((prev) => ({ ...prev, [pretId]: [] }))
    }
  }

  const handlePenalite = async (pretId) => {
    setPenaliteId(pretId)
    setActionMsg('')
    try {
      await api.appliquerPenalitePret(pretId)
      setActionMsg('Pénalité appliquée.')
      await load()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Pénalité impossible')
    } finally {
      setPenaliteId(null)
    }
  }

  const isOverdue = (p) => {
    if (p.statut === 'rembourse' || !p.dateEcheance) return false
    return new Date(p.dateEcheance).getTime() < nowMs
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Historique</p>
          <h1 className="sg-page-title">Emprunts</h1>
        </div>
      </header>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          placeholder="Rechercher membre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-chips" role="tablist">
          {[
            { id: 'TOUS', label: 'Tous' },
            { id: 'non rembourse', label: 'En cours' },
            { id: 'rembourse', label: 'Remboursés' },
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

      {actionMsg ? (
        <div className="inline-success" role="status">
          {actionMsg}
          <button type="button" className="inline-dismiss" onClick={() => setActionMsg('')}>
            OK
          </button>
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} emprunt${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun emprunt enregistré.</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((p) => {
            const rembs = remboursementsByPret[p.id] || []
            const totalRembourse = rembs
              .filter((r) => r.statut === 'valide_tr')
              .reduce((sum, r) => sum + Number(r.montant || 0), 0)
            const overdue = isOverdue(p)

            return (
              <li key={p.id} className="membre-card versement-card">
                <div className="membre-card-top">
                  <div className="membre-avatar" aria-hidden="true">
                    {(membreName(p.membre)[0] || '?').toUpperCase()}
                  </div>
                  <div className="membre-card-info">
                    <h2 className="membre-card-name">{membreName(p.membre)}</h2>
                    <p className="membre-card-mail">{p.membre?.couriel || '—'}</p>
                  </div>
                  <StatutBadge
                    type="pret"
                    statut={p.statut}
                    echu={overdue && p.statut !== 'rembourse'}
                  />
                </div>

                <div className="versement-amount">{formatMoney(p.montant)}</div>

                <div className="membre-card-meta">
                  <span>À rembourser : {formatMoney(p.montantARembourser)}</span>
                  <span>Accordé le {formatDate(p.datePret)}</span>
                  <span>Échéance : {formatDate(p.dateEcheance)}</span>
                  {p.dateRemboursement ? (
                    <span>Clôturé le {formatDate(p.dateRemboursement)}</span>
                  ) : null}
                  {p.membre ? (
                    <span>Dette membre : {formatMoney(p.membre.dette)}</span>
                  ) : null}
                </div>

                <div className="versement-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-touch"
                    onClick={() => toggleExpand(p.id)}
                  >
                    {expandedId === p.id
                      ? 'Masquer remboursements'
                      : 'Voir remboursements'}
                  </button>
                  {p.statut !== 'rembourse' && overdue ? (
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-touch"
                      disabled={penaliteId === p.id}
                      onClick={() => handlePenalite(p.id)}
                    >
                      {penaliteId === p.id ? '…' : 'Appliquer pénalité'}
                    </button>
                  ) : null}
                </div>

                {expandedId === p.id ? (
                  <div className="sg-emprunt-detail">
                    <p className="membre-dash-muted">
                      Total remboursé validé : {formatMoney(totalRembourse)}
                    </p>
                    {rembs.length === 0 ? (
                      <p className="membre-dash-muted">Aucun remboursement enregistré.</p>
                    ) : (
                      <ul className="sg-remb-list">
                        {rembs.map((r) => (
                          <li key={r.id} className="sg-remb-item">
                            <span>{formatMoney(r.montant)}</span>
                            <span>{formatDate(r.dateRemboursement)}</span>
                            <StatutBadge type="remboursement" statut={r.statut} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
