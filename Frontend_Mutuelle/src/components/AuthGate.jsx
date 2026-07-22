import { Navigate, Outlet } from 'react-router-dom'
import {
  getHomePath,
  getSession,
  isAuthenticated,
  isMembre,
  isSecretaireGeneral,
  isTresorier,
} from '../services/auth'

export function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  return <Outlet />
}

export function RequireSecretaireGeneral() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  if (!isSecretaireGeneral()) {
    return <Navigate to={getHomePath()} replace />
  }
  return <Outlet />
}

export function RequireTresorier() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  if (!isTresorier()) {
    return <Navigate to={getHomePath()} replace />
  }
  return <Outlet />
}

export function RequireMembre() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  if (!isMembre()) {
    return <Navigate to={getHomePath()} replace />
  }
  return <Outlet />
}

/** Redirige le membre vers l’étape obligatoire (activer / inscription / accueil). */
export function MembreOnboardingGate({ step }) {
  const session = getSession()
  if (!session || session.type !== 'membre') {
    return <Navigate to={getHomePath()} replace />
  }

  const membre = session.user
  const target = !membre?.compteVerifie
    ? 'activer'
    : !membre?.inscriptionPayee
      ? 'inscription'
      : 'home'

  if (step !== target) {
    if (target === 'activer') return <Navigate to="/membre/activer" replace />
    if (target === 'inscription') return <Navigate to="/membre/inscription" replace />
    return <Navigate to="/membre" replace />
  }

  return <Outlet />
}

export function RedirectIfAuth({ children }) {
  if (isAuthenticated()) {
    return <Navigate to={getHomePath()} replace />
  }
  return children
}
