import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onOfflineReady() {
        console.info('[PWA] Prête pour une utilisation hors ligne (shell).')
      },
      onNeedRefresh() {
        console.info('[PWA] Mise à jour disponible — rechargement automatique.')
      },
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
