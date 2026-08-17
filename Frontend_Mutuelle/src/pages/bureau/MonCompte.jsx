import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { getSession, updateAdminSession } from '../../services/auth'
import PasswordChangeSheet from '../../components/PasswordChangeSheet'

const POSTE_LABELS = {
  SECRETAIRE_GENERAL: 'Secrétaire général',
  TRESORIER: 'Trésorier',
  PRESIDENT: 'Président',
  COMMISSAIRE_AUX_COMPTES: 'Commissaire aux comptes',
}

export default function BureauMonCompte() {
  const session = getSession()
  const poste = session?.user
  const membreId = poste?.membre?.id
  const posteId = poste?.id

  const [membreInfo, setMembreInfo] = useState({
    nom: '',
    prenom: '',
    couriel: '',
    telephone: '',
  })
  const [login, setLogin] = useState('')
  const [loading, setLoading] = useState(true)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [submittingLogin, setSubmittingLogin] = useState(false)
  const [error, setError] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!posteId) {
      setLoading(false)
      return
    }
    let alive = true
    ;(async () => {
      try {
        const fresh = await api.getPoste(posteId)
        if (!alive) return
        const m = fresh.membre
        setMembreInfo({
          nom: m?.nom || '',
          prenom: m?.prenom || '',
          couriel: m?.couriel || '',
          telephone: m?.telephone || '',
        })
        setLogin(fresh.login || '')
        updateAdminSession(fresh)
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
  }, [posteId])

  const handlePassword = async ({ nouveau }) => {
    if (!posteId) return
    setPwdError('')
    setSubmittingLogin(true)
    try {
      const payload = {
        intitule: poste.intitule,
        description: poste.description,
        login: login.trim(),
        membre: { id: membreId },
        motDePasse: nouveau,
      }
      const updated = await api.updatePoste(posteId, payload)
      updateAdminSession(updated)
      setPwdOpen(false)
      setToast('Mot de passe bureau mis à jour.')
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Mise à jour impossible')
    } finally {
      setSubmittingLogin(false)
    }
  }

  const posteLabel = POSTE_LABELS[poste?.intitule] || poste?.intitule || 'Bureau'

  return (
    <div className="sg-page">
      <header className="sg-page-header">
        <div>
          <p className="sg-page-eyebrow">Profil</p>
          <h1 className="sg-page-title">Mon compte</h1>
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
        <div className="compte-sections">
          <section className="compte-section">
            <h2 className="membre-dash-section-title">Fonction</h2>
            <p className="sheet-hint">
              Vous êtes connecté en tant que <strong>{posteLabel}</strong>.
            </p>
          </section>

          <section className="compte-section">
            <h2 className="membre-dash-section-title">Informations personnelles</h2>
            <p className="sheet-hint">
              Ces informations appartiennent au profil membre. Elles se modifient depuis
              l’espace membre.
            </p>
            <dl className="profile-readonly">
              <div className="profile-readonly-row">
                <dt>Nom</dt>
                <dd>{membreInfo.nom || '—'}</dd>
              </div>
              <div className="profile-readonly-row">
                <dt>Prénom</dt>
                <dd>{membreInfo.prenom || '—'}</dd>
              </div>
              <div className="profile-readonly-row">
                <dt>E-mail membre</dt>
                <dd>{membreInfo.couriel || '—'}</dd>
              </div>
              <div className="profile-readonly-row">
                <dt>Téléphone</dt>
                <dd>{membreInfo.telephone || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="compte-section">
            <h2 className="membre-dash-section-title">Connexion bureau</h2>
            <p className="sheet-hint">
              Identifiant utilisé sur l’écran de connexion « Administration ».
            </p>
            <dl className="profile-readonly">
              <div className="profile-readonly-row">
                <dt>Login bureau</dt>
                <dd>{login || '—'}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn btn-primary btn-block btn-touch"
              style={{ marginTop: 16 }}
              onClick={() => {
                setPwdError('')
                setPwdOpen(true)
              }}
            >
              Changer le mot de passe
            </button>
          </section>

          {error ? (
            <div className="form-error form-error-light" role="alert">
              {error}
            </div>
          ) : null}
        </div>
      )}

      <PasswordChangeSheet
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSubmit={handlePassword}
        submitting={submittingLogin}
        error={pwdError}
        title="Mot de passe bureau"
      />
    </div>
  )
}
