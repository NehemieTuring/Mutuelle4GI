import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  getHomePath,
  getSession,
  isCommissaire,
  isMembre,
  isPresident,
  isSecretaireGeneral,
  isTresorier,
} from '../services/auth'

function displayName(session) {
  if (!session?.user) return 'Utilisateur'
  if (session.type === 'administration') {
    const poste = session.user
    const membre = poste.membre
    const name = membre
      ? [membre.prenom, membre.nom].filter(Boolean).join(' ')
      : poste.login
    return `${String(poste.intitule || 'Bureau').replace(/_/g, ' ')} — ${name}`
  }
  const m = session.user
  return [m.prenom, m.nom].filter(Boolean).join(' ') || m.couriel
}

export default function Espace() {
  const session = getSession()
  const navigate = useNavigate()

  if (
    isSecretaireGeneral() ||
    isTresorier() ||
    isPresident() ||
    isCommissaire() ||
    isMembre()
  ) {
    return <Navigate to={getHomePath()} replace />
  }

  const handleLogout = () => {
    api.logout()
    navigate('/connexion', { replace: true })
  }

  if (!session) {
    return <Navigate to="/connexion" replace />
  }

  return (
    <div className="espace-screen">
      <header className="espace-header">
        <div>
          <p className="espace-eyebrow">Mutuelle ENSPY</p>
          <h1 className="espace-title">Mon espace</h1>
        </div>
        <button type="button" className="btn btn-primary btn-touch" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <main className="espace-main">
        <p className="espace-welcome">Bonjour,</p>
        <p className="espace-name">{displayName(session)}</p>
        <p className="espace-hint">
          Connexion réussie au compte du bureau. Votre espace dédié arrive
          bientôt.
        </p>
        <Link to="/" className="btn btn-accent btn-block btn-touch">
          Retour à l’accueil
        </Link>
      </main>
    </div>
  )
}
