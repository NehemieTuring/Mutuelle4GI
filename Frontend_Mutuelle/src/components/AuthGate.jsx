import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {
  getHomePath,
  getSession,
  isAuthenticated,
  isCommissaire,
  isMembre,
  isPresident,
  isSecretaireGeneral,
  isTresorier,
} from '../services/auth'

function useAuthSession() {
  const [session, setSession] = useState(() => getSession())
  useEffect(() => {
    const sync = () => setSession(getSession())
    window.addEventListener('auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return session
}

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

export function RequirePresident() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  if (!isPresident()) {
    return <Navigate to={getHomePath()} replace />
  }
  return <Outlet />
}

export function RequireCommissaire() {
  if (!isAuthenticated()) {
    return <Navigate to="/connexion" replace />
  }
  if (!isCommissaire()) {
    return <Navigate to={getHomePath()} replace />
  }
  return <Outlet />
}

/** Redirige le membre vers l’étape obligatoire (activer / inscription / accueil). */
export function MembreOnboardingGate({ step }) {
  const session = useAuthSession()
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
    return <Navigate to="/membre/epargne" replace />
  }

  return <Outlet />
}

export function RedirectIfAuth({ children }) {
  if (isAuthenticated()) {
    return <Navigate to={getHomePath()} replace />
  }
  return children
}
