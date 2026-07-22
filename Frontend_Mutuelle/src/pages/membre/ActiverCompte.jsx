import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { getHomePath, getSession } from '../../services/auth'

export default function ActiverCompte() {
  const session = getSession()
  const membre = session?.user
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await api.modifierMotDePasse(membre.id, password)
      navigate(getHomePath(), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification impossible')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="gate-screen">
      <header className="gate-topbar">
        <span className="gate-brand">Mutuelle ENSPY</span>
        <button type="button" className="gate-logout" onClick={handleLogout}>
          Quitter
        </button>
      </header>

      <div className="gate-body">
        <p className="gate-step">Étape 1 sur 2</p>
        <h1 className="gate-title">Activez votre compte</h1>
        <p className="gate-lead">
          Bonjour{membre?.prenom ? ` ${membre.prenom}` : ''}. Pour des raisons de
          sécurité, choisissez un nouveau mot de passe avant d’accéder à la
          mutuelle.
        </p>

        <form className="gate-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              Nouveau mot de passe
            </label>
            <div className="password-field">
              <input
                id="new-password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              className="form-control"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="form-error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-accent btn-block btn-touch"
            disabled={loading || !password || !confirm}
          >
            {loading ? 'Activation…' : 'Activer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
