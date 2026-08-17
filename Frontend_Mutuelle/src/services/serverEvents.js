/**
 * Connexion SSE (Server-Sent Events) : le backend pousse un signal de rafraîchissement
 * vers le frontend après chaque mutation réussie (sans WebSocket).
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/** @type {EventSource | null} */
let source = null
let reconnectTimer = null

function streamUrl() {
  return `${API_BASE}/api/events/stream`
}

function dispatchRefresh(detail) {
  window.dispatchEvent(new CustomEvent('mutuelle-refresh', { detail }))
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    connectServerEvents()
  }, 3000)
}

export function connectServerEvents() {
  if (typeof EventSource === 'undefined') return null

  if (source) {
    source.close()
    source = null
  }

  const es = new EventSource(streamUrl())
  source = es

  es.addEventListener('refresh', (event) => {
    try {
      const detail = event.data ? JSON.parse(event.data) : { scope: 'all' }
      dispatchRefresh(detail)
    } catch {
      dispatchRefresh({ scope: 'all' })
    }
  })

  es.addEventListener('ping', () => {
    /* maintien de la connexion */
  })

  es.onerror = () => {
    es.close()
    if (source === es) source = null
    scheduleReconnect()
  }

  return es
}

export function disconnectServerEvents() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (source) {
    source.close()
    source = null
  }
}

/**
 * @param {string | string[] | null | undefined} watchScopes
 * @param {{ scope?: string }} detail
 */
export function shouldRefreshForScope(watchScopes, detail) {
  const eventScope = detail?.scope || 'all'
  if (!watchScopes) return true
  if (eventScope === 'all') return true
  const list = Array.isArray(watchScopes) ? watchScopes : [watchScopes]
  return list.includes(eventScope)
}
