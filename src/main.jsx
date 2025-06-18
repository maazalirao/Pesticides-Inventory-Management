import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Import Tailwind CSS styles
import App from './App.jsx'
import { ThemeProvider } from './lib/ThemeProvider.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom';

// Auth and Cart Providers
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { StoreSelectionProvider } from './contexts/StoreSelectionContext'

// Import your Publishable Keys
const ADMIN_CLERK_KEY = import.meta.env.VITE_CLERK_ADMIN_KEY
const STORE_CLERK_KEY = import.meta.env.VITE_CLERK_STORE_KEY

// Check if we have both clerk keys
if (!ADMIN_CLERK_KEY || !STORE_CLERK_KEY) {
  // Create a more visible error for debugging
  console.error("ERROR: Missing Clerk publishable keys environment variables")
  
  // Instead of throwing an error which causes a blank page, render an error message
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
        <p className="text-gray-700 mb-4">
          The application could not initialize because Clerk publishable keys are missing.
        </p>
        <p className="text-gray-600 text-sm">
          Please make sure the VITE_CLERK_ADMIN_KEY and VITE_CLERK_STORE_KEY environment variables are set.
        </p>
      </div>
    </div>
  )
} else {
  // Function to get the appropriate Clerk key based on current path
  const getClerkKey = () => {
    const isStorePath = window.location.pathname.startsWith('/store');
    return isStorePath ? STORE_CLERK_KEY : ADMIN_CLERK_KEY;
  };

  // Smart redirect function for after sign-in/sign-up
  const getRedirectUrl = () => {
    const currentPath = window.location.pathname;
    const isStorePath = currentPath.startsWith('/store');
    const isAdminPath = currentPath.startsWith('/admin');
    const isStoreOwnerPath = currentPath.startsWith('/storeowner');
    
    // Check if there's a preferred redirect stored in localStorage
    const preferredRedirect = localStorage.getItem('clerk_preferred_redirect');
    if (preferredRedirect && preferredRedirect.startsWith('/store')) {
      localStorage.removeItem('clerk_preferred_redirect');
      return preferredRedirect;
    }
    
    if (isStorePath) {
      // For store paths, stay in store interface - keep user on the same store page
      return currentPath;
    } else if (isAdminPath) {
      // For admin paths, stay in admin interface
      return currentPath !== '/' ? currentPath : "/admin";
    } else if (isStoreOwnerPath) {
      // For store owner paths, stay in store owner interface
      return currentPath !== '/' ? currentPath : "/storeowner";
    } else {
      // For landing/other pages, check if user came from store
      const referrer = document.referrer;
      if (referrer && referrer.includes('/store')) {
        return "/store";
      }
      // Default to landing page
      return "/";
    }
  };

  // Set theme colors based on path
  const isStorePath = window.location.pathname.startsWith('/store');
  const primaryColor = isStorePath ? "green" : "orange";
  const primaryColorHover = isStorePath ? "green-700" : "orange-600";
  
  // Get appropriate redirect URLs
  const afterSignInUrl = getRedirectUrl();
  const afterSignUpUrl = getRedirectUrl();
  const afterSignOutUrl = isStorePath ? "/store" : "/";
  
  // Custom sign-in, sign-up, and sign-out URLs
  const signInUrl = isStorePath ? "/store/sign-in" : "/admin/sign-in";
  const signUpUrl = isStorePath ? "/store/sign-up" : "/admin/sign-up";
  
  // Log configuration for debugging
  console.log(`Using ${isStorePath ? 'STORE' : 'ADMIN'} Clerk key for ${window.location.pathname}`);
  console.log(`Redirect URLs - SignIn: ${afterSignInUrl}, SignUp: ${afterSignUpUrl}, SignOut: ${afterSignOutUrl}`);
  
  // Render the application with the appropriate key
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider 
        publishableKey={getClerkKey()}
        afterSignInUrl={afterSignInUrl}
        afterSignUpUrl={afterSignUpUrl}
        afterSignOutUrl={afterSignOutUrl}
        signInUrl={signInUrl}
        signUpUrl={signUpUrl}
        appearance={{
          elements: {
            card: "bg-white shadow-lg rounded-lg w-full max-w-md mx-auto p-6",
            headerTitle: `text-2xl font-bold text-${isStorePath ? 'green' : 'gray'}-800`,
            headerSubtitle: `text-${isStorePath ? 'green' : 'gray'}-600 mt-1`,
            formButtonPrimary: `bg-${primaryColor}-500 hover:bg-${primaryColorHover} text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-${primaryColor}-500 focus:ring-opacity-50`,
            footerActionLink: `text-${primaryColor}-500 hover:text-${primaryColorHover}`,
            formFieldLabel: "block text-sm font-medium text-gray-700 mb-1",
            formFieldInput: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-${primaryColor}-500 focus:ring focus:ring-${primaryColor}-500 focus:ring-opacity-50`
          }
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <StoreSelectionProvider>
              <CartProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </CartProvider>
            </StoreSelectionProvider>
          </AuthProvider>
        </ThemeProvider>
      </ClerkProvider>
    </React.StrictMode>
  )
}
