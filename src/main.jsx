import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Import Tailwind CSS styles
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ShoppingAssistantProvider } from './contexts/ShoppingAssistantContext'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  // Create a more visible error for debugging
  console.error("ERROR: Missing VITE_CLERK_PUBLISHABLE_KEY environment variable")
  
  // Instead of throwing an error which causes a blank page, render an error message
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
        <p className="text-gray-700 mb-4">
          The application could not initialize because the Clerk publishable key is missing.
        </p>
        <p className="text-gray-600 text-sm">
          Please make sure the VITE_CLERK_PUBLISHABLE_KEY environment variable is set in your Vercel deployment.
        </p>
      </div>
    </div>
  )
} else {
  // Render the application normally when the key is present
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY} 
          afterSignInUrl="/admin"
          afterSignUpUrl="/admin"
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
          <AuthProvider>
            <CartProvider>
              <ShoppingAssistantProvider>
                <App />
              </ShoppingAssistantProvider>
            </CartProvider>
          </AuthProvider>
        </ClerkProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
