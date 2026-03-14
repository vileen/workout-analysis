import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './version.ts' // Import for cache busting
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
