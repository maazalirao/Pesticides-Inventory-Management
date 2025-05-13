import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const StoreSelectionContext = createContext(null);

export const useStoreSelection = () => useContext(StoreSelectionContext);

export const StoreSelectionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available stores when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    }
  }, [isAuthenticated]);

  // Setup axios interceptors to include store ID in all requests
  const setupAxiosInterceptors = (storeId) => {
    // Instead of managing interceptors directly, just update localStorage
    // The main interceptor in api.js will use this value
    localStorage.setItem('selectedStoreId', storeId);
    
    // Emit a custom event so components can refresh their data
    window.dispatchEvent(new CustomEvent('storeChanged', { 
      detail: { storeId, storeName: stores.find(s => s._id === storeId)?.name || 'Unknown Store' } 
    }));
    
    // Clear any cached data
    if (window.clearStoreSpecificCache) {
      window.clearStoreSpecificCache();
    }
  };

  // Check for stored selection on mount
  useEffect(() => {
    const storedStoreId = localStorage.getItem('selectedStoreId');
    if (storedStoreId && stores.length > 0) {
      const store = stores.find(s => s._id === storedStoreId);
      if (store) {
        setSelectedStore(store);
        
        // Update localStorage but don't set up a separate interceptor
        localStorage.setItem('selectedStoreId', store._id);
      }
    }
  }, [stores]);

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/stores/mystores');
      setStores(response.data);
      
      // If stores are returned and no selection exists, select the first store
      if (response.data.length > 0 && !selectedStore) {
        const storedStoreId = localStorage.getItem('selectedStoreId');
        const storeToSelect = storedStoreId 
          ? response.data.find(s => s._id === storedStoreId) || response.data[0] 
          : response.data[0];
          
        setSelectedStore(storeToSelect);
        localStorage.setItem('selectedStoreId', storeToSelect._id);
        
        // Setup axios interceptors for the selected store
        setupAxiosInterceptors(storeToSelect._id);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores');
      setLoading(false);
    }
  };

  // Select a store
  const selectStore = (storeId) => {
    const store = stores.find(s => s._id === storeId);
    if (store) {
      setSelectedStore(store);
      setupAxiosInterceptors(storeId);
      return true;
    }
    return false;
  };

  // Get store ID for direct use in components
  const getStoreId = () => selectedStore?._id || null;

  return (
    <StoreSelectionContext.Provider 
      value={{ 
        stores, 
        selectedStore, 
        selectStore, 
        loading, 
        error, 
        refreshStores: fetchStores,
        getStoreId
      }}
    >
      {children}
    </StoreSelectionContext.Provider>
  );
}; 