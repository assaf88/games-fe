import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'

createRoot(document.getElementById('root')).render(
    //<StrictMode> causes duplicate ws conn (dev only)
  // <StrictMode>
    <App />
  // </StrictMode>,
)
