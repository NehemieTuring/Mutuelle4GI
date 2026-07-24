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

const emptyForm = {
  nom: '',
  prenom: '',
  couriel: '',
  telephone: '',
  inscriptionPayee: false,
}

export default function SgMembres() {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [etatFilter, setEtatFilter] = useState('TOUS')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadMembres = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getMembres()
      setMembres(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await api.getMembres()
        if (!alive) return
        setMembres(Array.isArray(data) ? data : [])
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
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return membres.filter((m) => {
      if (etatFilter !== 'TOUS' && m.etat !== etatFilter) return false
      if (!q) return true
      const hay = [m.nom, m.prenom, m.couriel, m.telephone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [membres, search, etatFilter])

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setFormError('')
    setSuccessMsg('')
    setSheetOpen(true)
  }

  const openEdit = (m) => {
    setEditId(m.id)
    setForm({
      nom: m.nom || '',
      prenom: m.prenom || '',
      couriel: m.couriel || '',
      telephone: m.telephone || '',
      inscriptionPayee: !!m.inscriptionPayee,
    })
    setFormError('')
    setSuccessMsg('')
    setSheetOpen(true)
  }

  const closeCreate = () => {
    if (submitting) return
    setSheetOpen(false)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      if (editId) {
        await api.updateMembre(editId, {
          nom: form.nom.trim(),
          prenom: form.prenom.trim() || undefined,
          couriel: form.couriel.trim(),
          telephone: form.telephone.trim(),
        })
        setSuccessMsg('Profil membre mis à jour.')
      } else {
        await api.createMembre({
          nom: form.nom.trim(),
          prenom: form.prenom.trim() || undefined,
          couriel: form.couriel.trim(),
          telephone: form.telephone.trim(),
          inscriptionPayee: form.inscriptionPayee,
        })
        setSuccessMsg('Membre créé. Mot de passe temporaire : MonMot2Passe!')
      }
      setSheetOpen(false)
      setEditId(null)
      await loadMembres()
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : editId
            ? 'Mise à jour impossible'
            : 'Création impossible',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Gestion</p>
          <h1 className="sg-page-title">Membre</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch sg-create-btn"
          onClick={openCreate}
        >
          Créer
        </button>
      </header>

      <div className="sg-toolbar">
        <label className="sr-only" htmlFor="membre-search">
          Rechercher un membre
        </label>
        <input
          id="membre-search"
          className="form-control form-control-light"
          type="search"
          inputMode="search"
          placeholder="Rechercher nom, e-mail, téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-chips" role="tablist" aria-label="Filtrer par statut">
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

      {successMsg ? (
        <div className="inline-success" role="status">
          {successMsg}
          <button type="button" className="inline-dismiss" onClick={() => setSuccessMsg('')}>
            OK
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="inline-error" role="alert">
          {error}
          <button type="button" className="btn btn-primary btn-touch" onClick={loadMembres}>
            Réessayer
          </button>
        </div>
      ) : null}

      <div className="sg-list-meta">
        {loading
          ? 'Chargement…'
          : `${filtered.length} membre${filtered.length > 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div className="sg-empty">Chargement des membres…</div>
      ) : filtered.length === 0 ? (
        <div className="sg-empty">Aucun membre ne correspond à ces critères.</div>
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
                  {m.compteVerifie ? 'Compte vérifié' : 'Compte non vérifié'}
                </span>
                <span>
                  {m.inscriptionPayee ? 'Inscription payée' : 'Inscription due'}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block btn-touch"
                style={{ marginTop: 12 }}
                onClick={() => openEdit(m)}
              >
                Modifier
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="fab-create"
        onClick={openCreate}
        aria-label="Créer un membre"
      >
        +
      </button>

      {sheetOpen ? (
        <div className="sheet-overlay" role="presentation" onClick={closeCreate}>
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-membre-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <header className="sheet-header">
              <h2 id="create-membre-title">
                {editId ? 'Modifier le membre' : 'Nouveau membre'}
              </h2>
              <button
                type="button"
                className="sheet-close btn-touch"
                onClick={closeCreate}
                aria-label="Fermer"
              >
                ✕
              </button>
            </header>

            <form className="sheet-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="m-nom">
                  Nom
                </label>
                <input
                  id="m-nom"
                  className="form-control form-control-light"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  required
                  autoComplete="family-name"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="m-prenom">
                  Prénom
                </label>
                <input
                  id="m-prenom"
                  className="form-control form-control-light"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  autoComplete="given-name"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="m-mail">
                  Adresse e-mail
                </label>
                <input
                  id="m-mail"
                  className="form-control form-control-light"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  value={form.couriel}
                  onChange={(e) => setForm((f) => ({ ...f, couriel: e.target.value }))}
                  required
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-dark" htmlFor="m-tel">
                  Téléphone
                </label>
                <input
                  id="m-tel"
                  className="form-control form-control-light"
                  type="tel"
                  inputMode="tel"
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  required
                  autoComplete="tel"
                  disabled={submitting}
                />
              </div>

              {!editId ? (
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.inscriptionPayee}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, inscriptionPayee: e.target.checked }))
                    }
                    disabled={submitting}
                  />
                  <span>Inscription déjà payée</span>
                </label>
              ) : null}

              {formError ? (
                <div className="form-error form-error-light" role="alert">
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="btn btn-accent btn-block btn-touch"
                disabled={submitting}
              >
                {submitting
                  ? editId
                    ? 'Mise à jour…'
                    : 'Création…'
                  : editId
                    ? 'Enregistrer les modifications'
                    : 'Enregistrer le membre'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
