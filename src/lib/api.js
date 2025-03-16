import axios from 'axios';

// Use environment variable if available or fallback to auto-detected base URL
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.origin.includes('vercel.app') 
    ? `${window.location.origin}/api` 
    : `${window.location.origin}/api`);

console.log('API URL:', API_URL); // For debugging purposes

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout settings
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timed out, please try again',
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    console.log('Sending request to:', config.url, token ? 'With auth token' : 'Without auth token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, clearing auth data');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userToken');
      // For production, you might want to redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = async (email, password) => {
  try {
    console.log('Attempting login:', { email, apiUrl: API_URL });
    
    // Create a timeout promise that rejects after 15 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Login request timed out')), 15000)
    );
    
    // Create the actual login request
    const loginPromise = api.post('/users/login', { email, password });
    
    // Race between the login request and the timeout
    const response = await Promise.race([loginPromise, timeoutPromise]);
    
    // Extract data from response
    const { data } = response;
    
    console.log('Login successful, received data:', { 
      token: data.token ? '✓ present' : '✗ missing', 
      userId: data._id 
    });
    
    // Store user info and token in localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('userToken', data.token);
    
    return data;
  } catch (error) {
    console.error('Login error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle specific error cases
    if (error.message === 'Login request timed out' || error.response?.status === 504) {
      throw 'The login service is currently unavailable. Please try again in a few minutes.';
    }
    
    // Re-throw with more specific message
    throw error.response?.data?.message || `Login failed: ${error.message}`;
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await api.post('/users', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('userToken', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userToken');
};

// Product API calls
export const getProducts = async () => {
  try {
    console.log('Making API request to:', `${API_URL}/products`);
    const { data } = await api.get('/products');
    console.log('API response for products:', data);
    return data;
  } catch (error) {
    console.error('API error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data?.message || `Failed to fetch products: ${error.message}`;
  }
};

export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch product';
  }
};

export const createProduct = async (productData) => {
  try {
    const { data } = await api.post('/products', productData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create product';
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update product';
  }
};

export const deleteProduct = async (id) => {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete product';
  }
};

// Inventory API calls
export const getInventoryItems = async () => {
  try {
    console.log('Making API request to:', `${API_URL}/inventory`);
    const { data } = await api.get('/inventory');
    console.log('API response for inventory items:', data);
    return data;
  } catch (error) {
    console.error('API error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data?.message || `Failed to fetch inventory items: ${error.message}`;
  }
};

export const getInventoryItemById = async (id) => {
  try {
    const { data } = await api.get(`/inventory/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch inventory item';
  }
};

export const createInventoryItem = async (inventoryData) => {
  try {
    const { data } = await api.post('/inventory', inventoryData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create inventory item';
  }
};

export const updateInventoryItem = async (id, inventoryData) => {
  try {
    const { data } = await api.put(`/inventory/${id}`, inventoryData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update inventory item';
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const { data } = await api.delete(`/inventory/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete inventory item';
  }
};

export const addBatchToInventoryItem = async (id, batchData) => {
  try {
    const { data } = await api.post(`/inventory/${id}/batches`, batchData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add batch to inventory item';
  }
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    console.log('Checking database health');
    const { data } = await api.get('/dbhealth');
    console.log('Database health check result:', data);
    return data;
  } catch (error) {
    console.error('Database health check failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data?.message || `Database health check failed: ${error.message}`;
  }
};

export default api; 