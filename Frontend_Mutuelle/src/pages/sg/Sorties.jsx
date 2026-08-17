import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { NavLink, useOutletContext, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'
import ConfirmValidationSheet from '../../components/ConfirmValidationSheet'

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

function raisonLabel(raison) {
  if (!raison) return '—'
  if (raison === 'pret') return 'Emprunt'
  if (raison === 'retrait') return 'Retrait'
  if (String(raison).startsWith('aide_')) {
    return `Aide (${String(raison).replace(/^aide_/, '')})`
  }
  return raison
}

export default function SgSorties() {
  const { sousOnglet } = useParams()
  const { exerciceActif } = useOutletContext() || {}
  const mode = sousOnglet === 'toutes' ? 'toutes' : 'en-attente'

  const [sorties, setSorties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionError('')
    try {
      const data =
        mode === 'en-attente'
          ? await api.getSortiesEnAttenteSg()
          : await api.getToutesSorties()
      const list = Array.isArray(data) ? data : []
      list.sort(
        (a, b) =>
          new Date(b.dateSortie || 0).getTime() -
          new Date(a.dateSortie || 0).getTime(),
      )
      setSorties(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    load()
  }, [load])

  useMutuelleRefreshListener(load, 'sorties')


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sorties
    return sorties.filter((s) => {
      const hay = [membreName(s.membre), s.membre?.couriel, raisonLabel(s.raison)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [sorties, search])

  const askConfirm = (item) => {
    setActionError('')
    setConfirm({ item })
  }

  const closeConfirm = () => {
    if (actionId) return
    setConfirm(null)
  }

  const runConfirm = async () => {
    if (!confirm?.item) return
    const id = confirm.item.id
    setActionId(id)
    setActionError('')
    try {
      await api.accepterSortieSg(id)
      setConfirm(null)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Acceptation impossible')
    } finally {
      setActionId(null)
    }
  }

  const handleRefuse = async (id) => {
    setActionId(id)
    setActionError('')
    try {
      await api.refuserSortieSg(id)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Refus impossible')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Sorties d’argent</p>
          <h1 className="sg-page-title">Validation des sorties</h1>
        </div>
      </header>

      <div className="subtabs" role="tablist">
        <NavLink
          to="/sg/sorties/en-attente"
          className={({ isActive }) => `subtab ${isActive ? 'is-active' : ''}`}
        >
          En attente
        </NavLink>
        <NavLink
          to="/sg/sorties/toutes"
          className={({ isActive }) => `subtab ${isActive ? 'is-active' : ''}`}
        >
          Toutes les sorties
        </NavLink>
      </div>

      <div className="sg-toolbar">
        <input
          className="form-control form-control-light"
          type="search"
          placeholder="Rechercher membre, type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          {error}
          <button type="button" className="btn btn-primary btn-touch" onClick={load}>
            Réessayer
          </button>
        </div>
      ) : null}

      {actionError ? (
        <div className="inline-error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} sortie${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">
          {mode === 'en-attente'
            ? 'Aucune sortie en attente de votre validation.'
            : 'Aucune sortie enregistrée.'}
        </div>
      ) : (
        <ul className="membre-list">
          {filtered.map((s) => (
            <li key={s.id} className="membre-card versement-card">
              <div className="membre-card-top">
                <div className="membre-avatar" aria-hidden="true">
                  {(membreName(s.membre)[0] || '?').toUpperCase()}
                </div>
                <div className="membre-card-info">
                  <h2 className="membre-card-name">{membreName(s.membre)}</h2>
                  <p className="membre-card-mail">{s.membre?.couriel || '—'}</p>
                </div>
                <StatutBadge type="sortie" statut={s.statut} />
              </div>
              <div className="versement-amount">{formatMoney(s.montant)}</div>
              <div className="membre-card-meta">
                <span>{raisonLabel(s.raison)}</span>
                <span>{formatDate(s.dateSortie)}</span>
              </div>
              {s.statut === 'en_attente_secretaire_general' ? (
                <div className="versement-actions">
                  <button
                    type="button"
                    className="btn btn-accent btn-touch"
                    disabled={actionId === s.id || !exerciceActif}
                    onClick={() => askConfirm(s)}
                  >
                    {actionId === s.id ? '…' : 'Valider'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-touch"
                    disabled={actionId === s.id || !exerciceActif}
                    onClick={() => handleRefuse(s.id)}
                  >
                    Refuser
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmValidationSheet
        open={Boolean(confirm)}
        title="Confirmer la validation"
        lead="Confirmez que vous validez cette demande de sortie pour le montant indiqué."
        montant={confirm?.item?.montant}
        details={
          confirm
            ? [
                { label: 'Membre', value: membreName(confirm.item?.membre) },
                { label: 'Type', value: raisonLabel(confirm.item?.raison) },
              ]
            : []
        }
        confirmLabel="Oui, je confirme"
        busy={Boolean(actionId)}
        onConfirm={runConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}
