import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Import Tailwind CSS styles
import App from './App.jsx'
import { ThemeProvider } from './lib/ThemeProvider.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/"
      appearance={{
        elements: {
          card: "bg-white shadow-lg rounded-lg w-full max-w-md mx-auto p-6",
          headerTitle: "text-2xl font-bold text-gray-800",
          headerSubtitle: "text-gray-600 mt-1",
          formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50",
          footerActionLink: "text-orange-500 hover:text-orange-600",
          formFieldLabel: "block text-sm font-medium text-gray-700 mb-1",
          formFieldInput: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
        }
      }}
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
