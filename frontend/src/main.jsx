import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

const rootEl = document.getElementById('root')

function showFatalError(err) {
  if (!rootEl) return
  const message = (err && (err.message || err.toString())) || 'Unknown error'
  rootEl.innerHTML = `
    <div style="padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
      <h2 style="margin:0 0 8px;">App failed to start</h2>
      <pre style="white-space:pre-wrap;color:#b91c1c;">${message}</pre>
    </div>
  `
}

window.addEventListener('error', (event) => {
  showFatalError(event.error || event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  showFatalError(event.reason)
})

createRoot(rootEl).render(
  <App />
)
