import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

declare global {
  interface Window {
    __PORTAL_STANDALONE__?: boolean
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD && !window.__PORTAL_STANDALONE__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('No se pudo registrar el service worker', error)
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
