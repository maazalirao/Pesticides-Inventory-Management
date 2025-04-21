import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Store from './pages/Store';
import Settings from './pages/Settings';
import TestComponent from './components/TestComponent';

function App() {
  return (
    <Router>
      <ClerkLoading>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </ClerkLoading>
      
      <ClerkLoaded>
        <Routes>
          {/* Public routes - accessible to all users */}
          <Route path="/sign-in/*" element={<SignedOut><RedirectToSignIn /></SignedOut>} />
          
          {/* Protected routes - require authentication */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="products" element={<Products />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="store" element={<Store />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirect any unknown routes to dashboard, which will redirect to sign-in if needed */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ClerkLoaded>
    </Router>
  );
}

// Simple wrapper component to protect routes
function RequireAuth() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
