import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the Admin Auth Context
const AdminAuthContext = createContext();

// Custom hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Admin Auth Provider Component
export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          // Verify the user has admin or store_owner role
          if (user.role === 'admin' || user.role === 'store_owner') {
            setAdminUser(user);
            setIsAuthenticated(true);
            
            // Load selected store from localStorage
            const storedSelectedStore = localStorage.getItem('selectedStore');
            const storedSelectedStoreId = localStorage.getItem('selectedStoreId');
            
            if (storedSelectedStore && storedSelectedStoreId) {
              try {
                const parsedStore = JSON.parse(storedSelectedStore);
                setSelectedStore(parsedStore);
              } catch (error) {
                console.error('Error parsing stored selected store:', error);
                // Clear corrupted store data
                localStorage.removeItem('selectedStore');
                localStorage.removeItem('selectedStoreId');
                // Auto-select first store if available
                if (user.stores && user.stores.length > 0) {
                  selectStoreById(user.stores[0]._id, user.stores);
                }
              }
            } else if (user.stores && user.stores.length > 0) {
              // Auto-select first store if no store is selected
              selectStoreById(user.stores[0]._id, user.stores);
            }
          } else {
            // Clear invalid user data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            clearStoreSelection();
          }
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        // Clear corrupted data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        clearStoreSelection();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Helper function to clear store selection
  const clearStoreSelection = () => {
    localStorage.removeItem('selectedStore');
    localStorage.removeItem('selectedStoreId');
    setSelectedStore(null);
  };

  // Helper function to select store by ID
  const selectStoreById = (storeId, userStores = null) => {
    const stores = userStores || adminUser?.stores || [];
    const store = stores.find(s => s._id === storeId);
    
    if (store) {
      setSelectedStore(store);
      localStorage.setItem('selectedStoreId', store._id);
      localStorage.setItem('selectedStore', JSON.stringify(store));
      console.log('Store selected:', store.name, 'ID:', store._id);
      return true;
    } else {
      console.error('Store not found with ID:', storeId);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        stores: data.stores || []
      }));

      // Update state
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        stores: data.stores || []
      };
      
      setAdminUser(userData);
      setIsAuthenticated(true);

      // Handle store selection for store owners
      if (data.role === 'store_owner' && data.stores?.length > 0) {
        // Auto-select the first store
        selectStoreById(data.stores[0]._id, data.stores);
      } else if (data.role === 'admin') {
        // For admin, clear any previous store selection
        clearStoreSelection();
      }

      return { success: true, message: data.message, userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  // Function to change selected store (for store owners with multiple stores)
  const selectStore = (storeId) => {
    console.log('Attempting to select store:', storeId);
    
    if (!adminUser?.stores) {
      console.error('No stores available for user');
      return false;
    }
    
    return selectStoreById(storeId);
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    clearStoreSelection();
    
    // Update state
    setAdminUser(null);
    setIsAuthenticated(false);
    setSelectedStore(null);
    
    // Redirect to login
    navigate('/admin/login');
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if user has admin privileges
  const isAdmin = () => {
    return adminUser?.role === 'admin';
  };

  // Check if user has store owner privileges
  const isStoreOwner = () => {
    return adminUser?.role === 'store_owner' || adminUser?.role === 'admin';
  };

  // Check if user has access to a specific store
  const hasStoreAccess = (storeId) => {
    if (adminUser?.role === 'admin') return true;
    return adminUser?.stores?.some(store => store._id === storeId);
  };

  // Context value
  const value = {
    adminUser,
    isAuthenticated,
    isLoading,
    selectedStore,
    login,
    logout,
    selectStore,
    getAuthHeaders,
    isAdmin,
    isStoreOwner,
    hasStoreAccess,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 