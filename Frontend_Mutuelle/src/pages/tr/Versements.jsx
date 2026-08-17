import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutuelleRefresh, useMutuelleRefreshListener } from '../../hooks/useMutuelleRefresh'
import { NavLink, useOutletContext, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import StatutBadge from '../../components/StatutBadge'
import ConfirmValidationSheet from '../../components/ConfirmValidationSheet'

const STATUS_FILTERS = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'accepte', label: 'Validés' },
  { id: 'refuse', label: 'Refusés' },
]

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

function raisonLabel(raison) {
  const map = {
    inscription: 'Inscription',
    solidarite: 'Solidarité',
    epargne: 'Épargne',
    remboursement: 'Remboursement',
  }
  return map[raison] || raison || '—'
}

function membreName(membre) {
  if (!membre) return 'Membre inconnu'
  const name = [membre.prenom, membre.nom].filter(Boolean).join(' ')
  return name || membre.couriel || '—'
}

export default function TrVersements() {
  const { sousOnglet } = useParams()
  const { exerciceActif } = useOutletContext() || {}
  const mode = sousOnglet === 'tous' ? 'tous' : 'en-attente'

  const [versements, setVersements] = useState([])
  const [remboursements, setRemboursements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUS')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionError('')
    try {
      if (mode === 'en-attente') {
        const [versData, rembData] = await Promise.all([
          api.getVersementsEnAttente(),
          api.getRemboursementsEnAttente().catch(() => []),
        ])
        const list = Array.isArray(versData) ? versData : []
        list.sort(
          (a, b) =>
            new Date(b.dateVersement || 0).getTime() -
            new Date(a.dateVersement || 0).getTime(),
        )
        setVersements(list)
        const rembs = Array.isArray(rembData) ? rembData : []
        rembs.sort(
          (a, b) =>
            new Date(b.dateRemboursement || 0).getTime() -
            new Date(a.dateRemboursement || 0).getTime(),
        )
        setRemboursements(rembs)
      } else {
        const data = await api.getTousVersements()
        const list = Array.isArray(data) ? data : []
        list.sort(
          (a, b) =>
            new Date(b.dateVersement || 0).getTime() -
            new Date(a.dateVersement || 0).getTime(),
        )
        setVersements(list)
        setRemboursements([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    load()
  }, [load])

  useMutuelleRefreshListener(load, ['versements', 'remboursements'])


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return versements.filter((v) => {
      if (mode === 'tous' && statusFilter !== 'TOUS' && v.statut !== statusFilter) {
        return false
      }
      if (!q) return true
      const hay = [
        membreName(v.membre),
        v.membre?.couriel,
        raisonLabel(v.raison),
        v.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [versements, statusFilter, search, mode])

  const filteredRemboursements = useMemo(() => {
    if (mode !== 'en-attente') return []
    const q = search.trim().toLowerCase()
    if (!q) return remboursements
    return remboursements.filter((r) => {
      const m = r.pret?.membre
      const hay = [membreName(m), m?.couriel, 'remboursement', 'prêt', 'pret']
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [remboursements, search, mode])

  const askConfirm = (payload) => {
    setActionError('')
    setConfirm(payload)
  }

  const closeConfirm = () => {
    if (actionId) return
    setConfirm(null)
  }

  const runConfirm = async () => {
    if (!confirm) return
    const { kind, item } = confirm
    setActionId(item.id)
    setActionError('')
    try {
      if (kind === 'versement') {
        await api.accepterVersement(item.id)
        setToast('Versement validé.')
      } else if (kind === 'remboursement') {
        await api.validerRemboursement(item.id)
        setToast('Remboursement validé.')
      }
      setConfirm(null)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Validation impossible')
    } finally {
      setActionId(null)
    }
  }

  const handleRefuse = async (id) => {
    setActionId(id)
    setActionError('')
    try {
      await api.refuserVersement(id)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Refus impossible')
    } finally {
      setActionId(null)
    }
  }

  const handleRefuserRemboursement = async (id) => {
    setActionId(id)
    setActionError('')
    try {
      await api.refuserRemboursement(id)
      setToast('Remboursement refusé.')
      await load()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Refus du remboursement impossible',
      )
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Trésorerie</p>
          <h1 className="sg-page-title">Versements</h1>
        </div>
      </header>

      <div className="subtabs" role="tablist" aria-label="Sous-onglets versements">
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

      <div className="sg-toolbar">
        <label className="sr-only" htmlFor="versement-search">
          Rechercher
        </label>
        <input
          id="versement-search"
          className="form-control form-control-light"
          type="search"
          inputMode="search"
          placeholder="Rechercher membre, raison…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {mode === 'tous' ? (
          <div className="filter-chips" role="tablist" aria-label="Filtrer par statut">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === f.id}
                className={`filter-chip ${statusFilter === f.id ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

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

      {mode === 'en-attente' ? (
        <>
          <h3 className="membre-dash-section-title">Remboursements de prêts</h3>
          <div className="sg-list-meta">
            {loading
              ? 'Chargement…'
              : `${filteredRemboursements.length} remboursement${filteredRemboursements.length > 1 ? 's' : ''}`}
          </div>
          {loading ? (
            <div className="sg-empty">Chargement…</div>
          ) : filteredRemboursements.length === 0 ? (
            <div className="sg-empty" style={{ padding: '20px 16px', marginBottom: 16 }}>
              Aucun remboursement en attente.
            </div>
          ) : (
            <ul className="membre-list" style={{ marginBottom: 28 }}>
              {filteredRemboursements.map((r) => {
                const membre = r.pret?.membre
                return (
                  <li key={r.id} className="membre-card versement-card">
                    <div className="membre-card-top">
                      <div className="membre-avatar" aria-hidden="true">
                        {(membreName(membre)[0] || '?').toUpperCase()}
                      </div>
                      <div className="membre-card-info">
                        <h2 className="membre-card-name">{membreName(membre)}</h2>
                        <p className="membre-card-mail">{membre?.couriel || '—'}</p>
                      </div>
                      <StatutBadge type="remboursement" statut="en_attente_tr" />
                    </div>
                    <div className="versement-amount">{formatMoney(r.montant)}</div>
                    <div className="membre-card-meta">
                      <span>Remboursement de prêt</span>
                      <span>{formatDate(r.dateRemboursement)}</span>
                      <span>Dette membre : {formatMoney(membre?.dette)}</span>
                    </div>
                    <div className="versement-actions">
                      <button
                        type="button"
                        className="btn btn-accent btn-touch"
                        disabled={actionId === r.id || !exerciceActif}
                        onClick={() => askConfirm({ kind: 'remboursement', item: r })}
                      >
                        {actionId === r.id ? '…' : 'Valider'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost-dark btn-touch"
                        disabled={actionId === r.id || !exerciceActif}
                        onClick={() => handleRefuserRemboursement(r.id)}
                      >
                        Refuser
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <h3 className="membre-dash-section-title">Versements</h3>
        </>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} versement${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement des versements…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">
          {mode === 'en-attente'
            ? 'Aucun versement en attente de validation.'
            : 'Aucun versement ne correspond à ces critères.'}
        </div>
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
                <StatutBadge type="versement" statut={v.statut} />
              </div>

              <div className="versement-amount">{formatMoney(v.montant)}</div>

              <div className="membre-card-meta">
                <span>{raisonLabel(v.raison)}</span>
                <span>{formatDate(v.dateVersement)}</span>
                {v.description ? <span>{v.description}</span> : null}
                {v.raison === 'inscription' && v.membre ? (
                  <span>
                    {v.membre.inscriptionPayee
                      ? 'Inscription soldée'
                      : 'Inscription non soldée'}
                  </span>
                ) : null}
              </div>

              {v.statut === 'en_attente' ? (
                <div className="versement-actions">
                  <button
                    type="button"
                    className="btn btn-accent btn-touch"
                    disabled={actionId === v.id || !exerciceActif}
                    onClick={() => askConfirm({ kind: 'versement', item: v })}
                  >
                    {actionId === v.id ? '…' : 'Valider'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-touch"
                    disabled={actionId === v.id || !exerciceActif}
                    onClick={() => handleRefuse(v.id)}
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
        title={
          confirm?.kind === 'remboursement'
            ? 'Confirmer le remboursement'
            : 'Confirmer la réception'
        }
        lead={
          confirm?.kind === 'remboursement'
            ? 'Confirmez que vous avez bien reçu ce remboursement de prêt.'
            : 'Confirmez que vous avez bien reçu cette somme du membre.'
        }
        montant={confirm?.item?.montant}
        details={
          confirm
            ? [
                {
                  label: 'Membre',
                  value: membreName(
                    confirm.kind === 'remboursement'
                      ? confirm.item?.pret?.membre
                      : confirm.item?.membre,
                  ),
                },
                {
                  label: 'Type',
                  value:
                    confirm.kind === 'remboursement'
                      ? 'Remboursement de prêt'
                      : raisonLabel(confirm.item?.raison),
                },
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
