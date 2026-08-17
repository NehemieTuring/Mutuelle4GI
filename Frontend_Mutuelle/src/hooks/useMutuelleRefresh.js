import { useEffect, useRef } from 'react'
import { shouldRefreshForScope } from '../services/serverEvents'

/**
 * Écoute les signaux SSE et relance le chargement (sans toucher au montage initial).
 * @param {() => void | Promise<void>} loadFn
 * @param {string | string[] | null} [watchScopes]
 */
export function useMutuelleRefreshListener(loadFn, watchScopes = null) {
  const loadRef = useRef(loadFn)
  loadRef.current = loadFn

  useEffect(() => {
    const handler = (event) => {
      if (!shouldRefreshForScope(watchScopes, event.detail)) return
      loadRef.current()
    }
    window.addEventListener('mutuelle-refresh', handler)
    return () => window.removeEventListener('mutuelle-refresh', handler)
  }, [watchScopes])
}

/**
 * Charge au montage + recharge automatiquement sur signal SSE.
 * @param {() => void | Promise<void>} loadFn
 * @param {string | string[] | null} [watchScopes] null = tout écouter
 */
export function useMutuelleRefresh(loadFn, watchScopes = null) {
  const loadRef = useRef(loadFn)
  loadRef.current = loadFn

  useEffect(() => {
    loadRef.current()
  }, [])

  useMutuelleRefreshListener(loadFn, watchScopes)
}
