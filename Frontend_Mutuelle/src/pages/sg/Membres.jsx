import { useMemo, useState } from 'react'
import { useMutuelleRefresh } from '../../hooks/useMutuelleRefresh'
import { api } from '../../services/api'
import MembreCard from '../../components/MembreCard'
import {
  isValidPhone,
  normalizePhone,
  PHONE_HINT,
} from '../../utils/validation'

const ETAT_FILTERS = [
  { id: 'TOUS', label: 'Tous' },
  { id: 'a jour', label: 'À jour' },
  { id: 'non a jour', label: 'Non à jour' },
  { id: 'Inactif', label: 'Inactif' },
]

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

  useMutuelleRefresh(loadMembres, 'membres')

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
    setForm(emptyForm)
    setFormError('')
    setSuccessMsg('')
    setSheetOpen(true)
  }

  const closeCreate = () => {
    if (submitting) return
    setSheetOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const phone = normalizePhone(form.telephone)
    if (!isValidPhone(phone)) {
      setFormError(PHONE_HINT)
      return
    }
    setSubmitting(true)
    try {
      await api.createMembre({
        nom: form.nom.trim(),
        prenom: form.prenom.trim() || undefined,
        couriel: form.couriel.trim(),
        telephone: phone,
        inscriptionPayee: form.inscriptionPayee,
      })
      setSuccessMsg('Membre créé. Mot de passe temporaire : MonMot2Passe!')
      setSheetOpen(false)
      await loadMembres()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Création impossible',
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
          <h1 className="sg-page-title">Membres</h1>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-touch sg-create-btn"
          onClick={openCreate}
        >
          Ajouter un membre
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
            <MembreCard key={m.id} membre={m} />
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
              <h2 id="create-membre-title">Nouveau membre</h2>
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
                  placeholder="6XXXXXXXX ou 2XXXXXXXX"
                />
                <p className="sheet-hint" style={{ marginTop: 6 }}>
                  {PHONE_HINT}
                </p>
              </div>

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
                {submitting ? 'Création…' : 'Enregistrer le membre'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
