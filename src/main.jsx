import { createRoot } from 'react-dom/client'
import GamesList from './GamesList.jsx'
import './styles/index.css'
import './styles/App.css'

createRoot(document.getElementById('root')).render(
    //<StrictMode> causes duplicate ws conn (dev only)
    // <StrictMode>
      <GamesList />
    // </StrictMode>,  
)
