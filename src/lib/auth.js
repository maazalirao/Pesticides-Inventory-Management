import axios from 'axios';

// The base URL for the API
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // Hard-coded for development
  : '/api';  // For production, use relative URL

console.log('Using API URL:', API_URL);

/**
 * Login as admin in development mode
 * @returns {Promise<Object>} The token and user data
 */
export const loginAsAdmin = async () => {
  try {
    console.log('Attempting direct admin login...');
    
    // Direct login to admin
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'adminpassword123'
    });
    
    // Check if we got a token
    if (response.data && response.data.token) {
      console.log('Admin login successful, received token');
      
      // Set the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set the token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user || { role: 'admin', name: 'Admin User' }
      };
    } else {
      console.error('No token received from server');
      return { success: false, message: 'No token received' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Login failed'
    };
  }
};

/**
 * Repair store relationships
 * @param {string} token - The authentication token
 * @returns {Promise<Object>} The repair results
 */
export const repairStoreRelationships = async (token) => {
  try {
    console.log('Repairing store relationships...');
    
    // Get the token from localStorage if not provided
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      console.warn('No token available to repair relationships');
      return { success: false, message: 'No authentication token available' };
    }
    
    // Call the repair endpoint
    const response = await axios.get(`${API_URL}/stores/repair-relationships`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    console.log('Repair results:', response.data);
    
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Repair error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Repair failed'
    };
  }
};

/**
 * Fetch stores for the current user
 * @param {string} token - The authentication token
 * @returns {Promise<Array>} The user's stores
 */
export const fetchUserStores = async (token) => {
  try {
    console.log('Fetching user stores...');
    
    // Get the token from localStorage if not provided
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      console.warn('No token available to fetch stores');
      
      // Try auto-login in development
      if (process.env.NODE_ENV === 'development') {
        const loginResult = await loginAsAdmin();
        if (loginResult.success) {
          // Retry with the new token
          return fetchUserStores(loginResult.token);
        }
      }
      
      return [];
    }
    
    // Call the mystores endpoint with explicit authorization header
    const response = await axios.get(`${API_URL}/stores/mystores`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    console.log(`Stores fetched successfully: ${response.data.length} stores`);
    
    return response.data;
  } catch (error) {
    console.error('Fetch stores error:', error.response?.status || error.message);
    
    // If we get a 401 in development, try auto-login and retry
    if (error.response?.status === 401 && process.env.NODE_ENV === 'development') {
      try {
        console.log('Authentication error, attempting auto-login...');
        const loginResult = await loginAsAdmin();
        
        if (loginResult.success) {
          // Try again with new token
          return fetchUserStores(loginResult.token);
        }
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
      }
    }
    
    return [];
  }
};

/**
 * Create a default store for testing
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} The created store
 */
export const createDefaultStore = async (token) => {
  try {
    console.log('Creating default store for testing...');
    
    // Get token from localStorage if not provided
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      console.warn('No token available to create store');
      
      // Try auto-login in development
      if (process.env.NODE_ENV === 'development') {
        const loginResult = await loginAsAdmin();
        if (loginResult.success) {
          return createDefaultStore(loginResult.token);
        }
      }
      
      return { success: false, message: 'Authentication required' };
    }
    
    // Create a store with basic information
    const storeData = {
      name: 'Default Test Store',
      description: 'This is a default store created for testing',
      email: 'store@example.com',
      phone: '555-123-4567',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'Test Country'
      }
    };
    
    const response = await axios.post(`${API_URL}/stores`, storeData, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    console.log('Default store created:', response.data);
    
    // Now repair store relationships to ensure it's linked to the user
    await axios.get(`${API_URL}/stores/repair-relationships`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    return { 
      success: true, 
      message: 'Default store created',
      store: response.data 
    };
  } catch (error) {
    console.error('Error creating default store:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Failed to create store'
    };
  }
}; 