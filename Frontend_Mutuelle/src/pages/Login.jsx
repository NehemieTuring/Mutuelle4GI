import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getHomePath } from '../services/auth'

/** @typedef {'membre' | 'administration'} AccountType */

export default function Login() {
  /** @type {[AccountType, function]} */
  const [accountType, setAccountType] = useState('membre')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (accountType === 'membre') {
        await api.loginMembre(login.trim(), password)
      } else {
        await api.loginAdministration(login.trim(), password)
      }
      navigate(getHomePath(), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <header className="login-topbar">
        <Link to="/" className="login-back" aria-label="Retour à l’accueil">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className="login-topbar-title">Connexion</span>
        <span className="login-topbar-spacer" aria-hidden="true" />
      </header>

      <div className="login-body">
        <div className="login-brand-block">
          <p className="login-brand">Mutuelle ENSPY</p>
          <h1 className="login-heading">Bienvenue</h1>
          <p className="login-sub">
            Connectez-vous avec votre adresse e-mail et votre mot de passe.
          </p>
        </div>

        <div
          className="login-segment"
          role="tablist"
          aria-label="Type de compte"
        >
          <button
            type="button"
            role="tab"
            aria-selected={accountType === 'membre'}
            className={`login-segment-btn ${accountType === 'membre' ? 'is-active' : ''}`}
            onClick={() => setAccountType('membre')}
          >
            Membre
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accountType === 'administration'}
            className={`login-segment-btn ${accountType === 'administration' ? 'is-active' : ''}`}
            onClick={() => setAccountType('administration')}
          >
            Bureau
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              {accountType === 'membre' ? 'Adresse e-mail' : 'Identifiant (e-mail du poste)'}
            </label>
            <input
              id="login-email"
              className="form-control"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={
                accountType === 'membre'
                  ? 'prenom.nom@univ-yaounde1.cm'
                  : 'president@mutuelle.cm'
              }
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Mot de passe
            </label>
            <div className="password-field">
              <input
                id="login-password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
            </div>
          </div>

          {error ? (
            <div className="form-error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-accent btn-block btn-touch"
            disabled={loading || !login.trim() || !password}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
