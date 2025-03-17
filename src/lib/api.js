import axios from 'axios';

// For local development, explicitly use the local development URL if available
// For production, fallback to relative path
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `${window.location.origin}/api`);

// Log the API URL being used (helpful for debugging)
console.log('API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('userToken');
    
    // Debug token
    console.log('Request to:', config.url);
    console.log('Token available:', !!token);
    
    // Only add the token if it exists
    if (token) {
      // Ensure the headers object exists
      config.headers = config.headers || {};
      
      // Set the Authorization header with the Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
  inventory: {
    data: null,
    timestamp: 0
  },
  products: {
    data: null,
    timestamp: 0
  }
};

// Helper function to check if cache is valid
const isCacheValid = (key) => {
  return cache[key]?.data && (Date.now() - cache[key].timestamp < CACHE_DURATION);
};

// Auth API calls
export const login = async (email, password) => {
  try {
    const { data } = await api.post('/users/login', { email, password });
    
    // Ensure we store the token properly
    if (data && data.token) {
      console.log('Login successful, storing token');
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userToken', data.token);
      
      // Add a log to confirm token is stored
      console.log('Token stored:', !!localStorage.getItem('userToken'));
    } else {
      console.error('Login response missing token:', data);
      throw new Error('Invalid login response');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw error.response?.data?.message || 'Login failed. Please try again.';
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await api.post('/users', { name, email, password });
    
    if (data && data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userToken', data.token);
      return data;
    } else {
      throw new Error('Invalid registration response');
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response?.status === 400) {
      throw new Error('Email already registered');
    }
    throw error.response?.data?.message || 'Registration failed. Please try again.';
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userToken');
  window.location.href = '/login';
};

// Product API calls
export const getProducts = async () => {
  try {
    // Check cache first
    if (isCacheValid('products')) {
      console.log('Returning cached products data');
      return cache.products.data;
    }

    console.log('Fetching fresh products data...');
    const response = await api.get('/products');
    
    // Update cache
    cache.products = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  } catch (error) {
    console.error('Products fetch error:', error);
    throw error.response?.data?.message || 'Failed to fetch products';
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
    // Check cache first
    if (isCacheValid('inventory')) {
      console.log('Returning cached inventory data');
      return cache.inventory.data;
    }

    console.log('Fetching fresh inventory data...');
    const response = await api.get('/inventory');
    
    // Update cache
    cache.inventory = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  } catch (error) {
    console.error('Inventory fetch error:', error);
    throw error.response?.data?.message || 'Failed to fetch inventory items';
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

// Clear cache function
export const clearCache = (key) => {
  if (key) {
    cache[key] = { data: null, timestamp: 0 };
  } else {
    Object.keys(cache).forEach(k => {
      cache[k] = { data: null, timestamp: 0 };
    });
  }
};

export default api; 