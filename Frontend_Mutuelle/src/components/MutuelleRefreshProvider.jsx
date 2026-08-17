import { useEffect } from 'react'
import { isAuthenticated } from '../services/auth'
import { connectServerEvents, disconnectServerEvents } from '../services/serverEvents'

/**
 * Ouvre le flux SSE tant qu'un utilisateur est connecté.
 */
export default function MutuelleRefreshProvider({ children }) {
  useEffect(() => {
    const sync = () => {
      if (isAuthenticated()) {
        connectServerEvents()
      } else {
        disconnectServerEvents()
      }
    }

    sync()
    window.addEventListener('auth-change', sync)
    return () => {
      window.removeEventListener('auth-change', sync)
      disconnectServerEvents()
    }
  }, [])

  return children
}
