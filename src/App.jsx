import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import Login from './pages/Login';
import Register from './pages/Register';
import TestComponent from './components/TestComponent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userInfoFromStorage = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    const userToken = localStorage.getItem('userToken');
    
    console.log('App startup - User info available:', !!userInfoFromStorage);
    console.log('App startup - Token available:', !!userToken);
    
    if (userInfoFromStorage && userToken) {
      setIsLoggedIn(true);
      setUserInfo(userInfoFromStorage);
    } else {
      // If we're missing either the token or user info, clear both for consistency
      if (userInfoFromStorage || userToken) {
        console.log('Inconsistent auth state, clearing localStorage');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isLoggedIn ? <Register setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} /> : <Navigate to="/" />} />
        
        {/* Test route */}
        <Route path="/test" element={<TestComponent />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <MainLayout userInfo={userInfo} setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo}>
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

        {/* New routes for additional features */}
        <Route
          path="/invoices"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Invoices />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/reports"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Reports />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/store"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Store />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/settings"
          element={
            isLoggedIn ? (
              <MainLayout>
                <Settings />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
