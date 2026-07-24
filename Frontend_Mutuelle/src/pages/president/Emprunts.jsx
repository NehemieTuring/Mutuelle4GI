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
  if (!membre) return 'Membre inconnu'
  return [membre.prenom, membre.nom].filter(Boolean).join(' ') || membre.couriel || '—'
}

export default function PresidentEmprunts() {
  const [prets, setPrets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('TOUS')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [nowMs] = useState(() => Date.now())

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTousPrets()
      setPrets(Array.isArray(data) ? data : [])
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
    return prets.filter((p) => {
      if (filter === 'actifs') return p.statut === 'non rembourse'
      if (filter === 'echus') {
        return (
          p.statut === 'non rembourse' &&
          p.dateEcheance &&
          new Date(p.dateEcheance).getTime() <= nowMs
        )
      }
      if (filter === 'rembourses') return p.statut === 'rembourse'
      return true
    })
  }, [prets, filter, nowMs])

  const handleVerifier = async () => {
    setBusy(true)
    setToast('')
    setError('')
    try {
      await api.verifierEcheancesPrets()
      setToast('Vérification des échéances effectuée.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vérification impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Présidence</p>
          <h1 className="sg-page-title">Emprunts</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch"
          disabled={busy}
          onClick={handleVerifier}
        >
          {busy ? '…' : 'Vérifier échéances'}
        </button>
      </header>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="filter-chips" role="tablist" aria-label="Filtrer les emprunts">
        {[
          { id: 'TOUS', label: 'Tous' },
          { id: 'actifs', label: 'Actifs' },
          { id: 'echus', label: 'Échus' },
          { id: 'rembourses', label: 'Remboursés' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-chip ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="sg-list-meta">
        {loading ? 'Chargement…' : `${filtered.length} emprunt(s)`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun emprunt pour ce filtre.</div>
      ) : (
        <ul className="membre-list">
          {filtered.map((p) => {
            const echu =
              p.statut === 'non rembourse' &&
              p.dateEcheance &&
              new Date(p.dateEcheance).getTime() <= nowMs
            return (
              <li key={p.id} className="membre-card">
                <div className="membre-card-top">
                  <div className="membre-card-info">
                    <h2 className="membre-card-name">{membreName(p.membre)}</h2>
                    <p className="membre-card-mail">{formatDate(p.datePret)}</p>
                  </div>
                  <span className={echu ? 'badge badge-danger' : 'badge badge-warning'}>
                    {echu ? 'Échu' : p.statut || '—'}
                  </span>
                </div>
                <div className="versement-amount">{formatMoney(p.montant)}</div>
                <div className="membre-card-meta">
                  <span>À rembourser : {formatMoney(p.montantARembourser)}</span>
                  <span>Échéance : {formatDate(p.dateEcheance)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
