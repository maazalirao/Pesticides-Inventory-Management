import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import Tailwind CSS styles
import App from './App.jsx'

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
