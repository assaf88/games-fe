import { createRoot } from 'react-dom/client'
import GamesList from './GamesList.jsx'
import './styles/index.css'
import './styles/App.css'

// Suppress react-beautiful-dnd defaultProps memo warning in dev
const originalConsoleError = console.error;
console.error = function (...args) {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps will be removed from memo components')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
    //<StrictMode> causes duplicate ws conn (dev only)
    // <StrictMode>
      <GamesList />
    // </StrictMode>,  
)
