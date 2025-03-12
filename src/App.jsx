import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Login from './pages/Login';
import TestComponent from './components/TestComponent';

function App() {
  // In a real app, this would be handled by a proper auth system
  const isLoggedIn = true;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
        
        {/* Test route */}
        <Route path="/test" element={<TestComponent />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/inventory"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Inventory />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/products"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Products />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/suppliers"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Suppliers />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/customers"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Customers />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Add more routes for other features */}
        {/* Invoices, Reports, Online Store, Settings */}
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
