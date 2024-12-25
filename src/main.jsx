// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if (!process.env.PRODUCTION && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}

createRoot(document.getElementById('root')).render(
    //<StrictMode> causes duplicate ws conn (dev only)
  // <StrictMode>
    <App />
  // </StrictMode>,
)
