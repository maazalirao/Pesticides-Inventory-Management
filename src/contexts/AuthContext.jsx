import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// API URL configuration - improved for Vercel deploymentconst getAPIUrl = () => {  // Check if we're on Vercel specifically  if (window.location.hostname.includes('vercel.app') || process.env.NODE_ENV === 'production') {    return '/api';  }    // Development - check for proxy vs direct API  const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';  return useLocalApi ? 'http://localhost:5000/api' : '/api';};const API_URL = getAPIUrl();

// Admin credentials for testing
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStores, setUserStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    const storedIsAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedIsAuth) {
      setUser(JSON.parse(storedUser));
      setUserRole(JSON.parse(storedUser).role);
      setIsAuthenticated(true);
      fetchUserStores();
    }
  }, []);

  // Fetch stores associated with the user
  const fetchUserStores = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/stores/mystores`);
      
      console.log('Fetched stores:', data);
      setUserStores(data);
      
      if (data && data.length > 0 && !selectedStore) {
        setSelectedStore(data[0]);
        localStorage.setItem('selectedStoreId', data[0]._id);
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
      return [];
    }
  };

  // Admin login with username and password
  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    
    // Simple admin authentication (for testing)
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData = { name: 'Admin User', role: 'admin', username };
      setUser(userData);
      setUserRole('admin');
      setIsAuthenticated(true);
      
      // Store auth state in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      await fetchUserStores();
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      setAuthError('Invalid username or password');
      return { success: false, error: 'Invalid username or password' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setUserStores([]);
    setSelectedStore(null);
    
    // Clear auth state from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedStoreId');
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!isAuthenticated || !userRole) return false;
    return userRole === role;
  };

  // Select a different store
  const selectStore = (storeId) => {
    console.log('Selecting store:', storeId);
    
    if (!storeId) {
      console.warn('No storeId provided to selectStore');
      return false;
    }
    
    const store = userStores.find(store => store._id === storeId);
    if (store) {
      console.log('Store found and selected:', store.name);
      
      try {
        // Store a flag that indicates we're switching stores
        // Other components can check this to know if they should force-reload their data
        localStorage.setItem('storeSwitchTimestamp', Date.now().toString());
        
        // Clear any cached data for the previous store
        if (selectedStore && selectedStore._id) {
          // Clear local storage data specific to the previous store
          const previousStoreKeys = Object.keys(localStorage)
            .filter(key => key.includes(selectedStore._id));
          
          previousStoreKeys.forEach(key => {
            console.log('Clearing previous store data:', key);
            localStorage.removeItem(key);
          });
          
          // Clear any in-memory cache (if there's a cache object available)
          if (window.storeDataCache) {
            delete window.storeDataCache[selectedStore._id];
          }
        }
        
        // Set the new selected store
        setSelectedStore(store);
        
        // Save this preference in localStorage
        localStorage.setItem('selectedStoreId', storeId);
        
        // Clear application data cache for this store
        // This forces components to refetch fresh data for the new store
        if (window.clearStoreSpecificCache) {
          window.clearStoreSpecificCache();
        }
        
        // Force invalidate all API caches
        if (window.clearAllCaches) {
          window.clearAllCaches();
        }
        
        // Dispatch a custom event to notify components about store change
        const storeChangeEvent = new CustomEvent('storeChanged', { 
          detail: { storeId: storeId, storeName: store.name } 
        });
        window.dispatchEvent(storeChangeEvent);
      } catch (error) {
        console.error('Error during store selection:', error);
        // Still update the selected store even if cache clearing fails
        setSelectedStore(store);
        localStorage.setItem('selectedStoreId', storeId);
      }
      
      return store;
    }
    
    console.warn('Store not found with ID:', storeId);
    return false;
  };

  const value = {
    user,
    role: userRole,
    isAuthenticated,
    loading,
    authError,
    login,
    logout,
    hasRole,
    stores: userStores,
    selectedStore,
    selectStore,
    refreshStores: fetchUserStores
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 