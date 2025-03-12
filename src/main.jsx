import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Import Tailwind CSS styles
import App from './App.jsx'
import { ThemeProvider } from './lib/ThemeProvider.jsx'

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
