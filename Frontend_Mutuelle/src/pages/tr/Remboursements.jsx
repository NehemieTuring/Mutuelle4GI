import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
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

function membreName(membre) {
  if (!membre) return 'Membre inconnu'
  const name = [membre.prenom, membre.nom].filter(Boolean).join(' ')
  return name || membre.couriel || '—'
}

export default function TrRemboursements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionError('')
    try {
      const data = await api.getRemboursementsEnAttente()
      const list = Array.isArray(data) ? data : []
      list.sort(
        (a, b) =>
          new Date(b.dateRemboursement || 0).getTime() -
          new Date(a.dateRemboursement || 0).getTime(),
      )
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getRemboursementsEnAttente()
        if (!alive) return
        const list = Array.isArray(data) ? data : []
        list.sort(
          (a, b) =>
            new Date(b.dateRemboursement || 0).getTime() -
            new Date(a.dateRemboursement || 0).getTime(),
        )
        setItems(list)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Chargement impossible')
        setItems([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const handleValider = async (id) => {
    setActionId(id)
    setActionError('')
    try {
      await api.validerRemboursement(id)
      setToast('Remboursement validé.')
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Validation impossible')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Trésorerie</p>
          <h1 className="sg-page-title">Remboursements</h1>
        </div>
      </header>

      <div className="subtabs" role="tablist" aria-label="Sous-onglets trésorerie">
        <NavLink
          to="/tr/versements/en-attente"
          role="tab"
          className={({ isActive }) => `subtab ${isActive ? 'is-active' : ''}`}
        >
          En attente de validation
        </NavLink>
        <NavLink
          to="/tr/versements/tous"
          role="tab"
          className={({ isActive }) => `subtab ${isActive ? 'is-active' : ''}`}
        >
          Tous les versements
        </NavLink>
        <NavLink
          to="/tr/remboursements"
          role="tab"
          className={({ isActive }) => `subtab ${isActive ? 'is-active' : ''}`}
        >
          Remboursements
        </NavLink>
      </div>

      <p className="membre-dash-muted" style={{ marginBottom: 16 }}>
        Demandes de remboursement en attente de validation. La dette du membre et
        la caisse des épargnes sont mises à jour à la validation.
      </p>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      {actionError ? (
        <div className="inline-error" role="alert">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : error ? (
        <div className="inline-error" role="alert">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="sg-empty">Aucun remboursement en attente.</div>
      ) : (
        <ul className="membre-list">
          {items.map((r) => {
            const pret = r.pret
            const membre = pret?.membre
            return (
              <li key={r.id} className="membre-card">
                <div className="membre-card-top">
                  <div className="membre-card-info">
                    <h2 className="membre-card-name">{formatMoney(r.montant)}</h2>
                    <p className="membre-card-mail">
                      {membreName(membre)}
                      {membre?.couriel ? ` · ${membre.couriel}` : ''}
                    </p>
                  </div>
                  <span className="badge badge-warning">Attente TR</span>
                </div>
                <div className="membre-card-meta">
                  <span>Demandé le {formatDate(r.dateRemboursement)}</span>
                  <span>
                    Prêt : {formatMoney(pret?.montant)} · dette membre{' '}
                    {formatMoney(membre?.dette)}
                  </span>
                  <span>Échéance : {formatDate(pret?.dateEcheance)}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-accent btn-touch"
                    disabled={actionId === r.id}
                    onClick={() => handleValider(r.id)}
                  >
                    {actionId === r.id ? 'Validation…' : 'Valider'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
