import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[PWA] Prête pour une utilisation hors ligne (shell).')
  },
  onNeedRefresh() {
    console.info('[PWA] Mise à jour disponible — rechargement automatique.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
