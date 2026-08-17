import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { api } from '../../services/api'
import { getSession, updateMembreSession } from '../../services/auth'
import StatutBadge from '../../components/StatutBadge'
import PasswordChangeSheet from '../../components/PasswordChangeSheet'
import {
  isValidPhone,
  normalizePhone,
  PHONE_HINT,
  inscriptionLabel,
  solidariteLabel,
} from '../../utils/validation'

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function MembreMonCompte() {
  const navigate = useNavigate()
  const { refreshMembre, openSolidarite, exerciceActif } = useOutletContext() || {}
  const session = getSession()
  const membreId = session?.user?.id

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    couriel: '',
    telephone: '',
  })
  const [membre, setMembre] = useState(session?.user)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!membreId) {
      setLoading(false)
      return
    }
    let alive = true
    ;(async () => {
      try {
        const fresh = await api.getMembre(membreId)
        if (!alive) return
        setMembre(fresh)
        setForm({
          nom: fresh.nom || '',
          prenom: fresh.prenom || '',
          couriel: fresh.couriel || '',
          telephone: fresh.telephone || '',
        })
        updateMembreSession(fresh)
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Chargement impossible')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [membreId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const phone = normalizePhone(form.telephone)
    if (!isValidPhone(phone)) {
      setError(PHONE_HINT)
      return
    }
    setSubmitting(true)
    try {
      const updated = await api.updateMembre(membreId, {
        nom: form.nom.trim(),
        prenom: form.prenom.trim() || undefined,
        couriel: form.couriel.trim(),
        telephone: phone,
      })
      setMembre(updated)
      updateMembreSession(updated)
      await refreshMembre?.()
      setToast('Informations mises à jour.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePassword = async ({ ancien, nouveau }) => {
    setPwdError('')
    setPwdSubmitting(true)
    try {
      await api.modifierMotDePasse(membreId, nouveau, ancien)
      setPwdOpen(false)
      setToast('Mot de passe modifié.')
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Modification impossible')
    } finally {
      setPwdSubmitting(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="membre-page">
      <header className="membre-page-header">
        <div>
          <p className="membre-dash-eyebrow">Profil</p>
          <h1 className="membre-dash-title">Mon compte</h1>
        </div>
      </header>

      {toast ? (
        <div className="inline-success" role="status">
          {toast}
          <button type="button" className="inline-dismiss" onClick={() => setToast('')}>
            OK
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="membre-dash-muted">Chargement…</p>
      ) : (
        <>
          <section className="membre-dash-status" aria-label="Statut du compte">
            <div className="membre-dash-status-row">
              <span>Statut mutuelle</span>
              <StatutBadge type="membre" statut={membre?.etat} />
            </div>
            <div className="membre-dash-status-row">
              <span>Inscription</span>
              <strong className={!membre?.inscriptionPayee ? 'text-alert' : undefined}>
                {membre?.inscriptionPayee ? 'Payée' : 'Non payée'}
              </strong>
            </div>
            <div className="membre-dash-status-row">
              <span>Solidarité</span>
              <strong className={!membre?.solidaritePayee ? 'text-alert' : undefined}>
                {membre?.solidaritePayee
                  ? 'Soldée'
                  : `Non soldée (${formatMoney(membre?.detteSolidarite)})`}
              </strong>
            </div>
            {!membre?.solidaritePayee ? (
              <button
                type="button"
                className="btn btn-solidarite btn-block btn-touch"
                style={{ marginTop: 12 }}
                onClick={() => openSolidarite?.()}
                disabled={!exerciceActif}
              >
                {exerciceActif ? 'Payer ma solidarité' : 'Exercice non ouvert'}
              </button>
            ) : null}
          </section>

          <div className="membre-status-chips" style={{ marginBottom: 16 }}>
            <span
              className={
                membre?.inscriptionPayee
                  ? 'status-chip status-chip-ok'
                  : 'status-chip status-chip-alert'
              }
            >
              {inscriptionLabel(membre?.inscriptionPayee)}
            </span>
            <span
              className={
                membre?.solidaritePayee
                  ? 'status-chip status-chip-ok'
                  : 'status-chip status-chip-alert'
              }
            >
              {solidariteLabel(membre?.solidaritePayee)}
            </span>
          </div>

          <h3 className="membre-dash-section-title">Informations personnelles</h3>
          <form className="params-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="mc-nom">
                Nom
              </label>
              <input
                id="mc-nom"
                className="form-control form-control-light"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="mc-prenom">
                Prénom
              </label>
              <input
                id="mc-prenom"
                className="form-control form-control-light"
                value={form.prenom}
                onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="mc-mail">
                E-mail
              </label>
              <input
                id="mc-mail"
                className="form-control form-control-light"
                type="email"
                inputMode="email"
                value={form.couriel}
                onChange={(e) => setForm((f) => ({ ...f, couriel: e.target.value }))}
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-dark" htmlFor="mc-tel">
                Téléphone
              </label>
              <input
                id="mc-tel"
                className="form-control form-control-light"
                type="tel"
                inputMode="tel"
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                required
                disabled={submitting}
                placeholder="6XXXXXXXX ou 2XXXXXXXX"
              />
              <p className="sheet-hint" style={{ marginTop: 6 }}>
                {PHONE_HINT}
              </p>
            </div>

            {error ? (
              <div className="form-error form-error-light" role="alert">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn btn-accent btn-block btn-touch"
              disabled={submitting}
            >
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-primary btn-block btn-touch"
            style={{ marginTop: 20 }}
            onClick={() => {
              setPwdError('')
              setPwdOpen(true)
            }}
          >
            Changer le mot de passe
          </button>

          <button
            type="button"
            className="btn btn-danger-outline btn-block btn-touch"
            style={{ marginTop: 28 }}
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </>
      )}

      <PasswordChangeSheet
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSubmit={handlePassword}
        submitting={pwdSubmitting}
        error={pwdError}
      />
    </div>
  )
}
