import axios from 'axios';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : '/api');

console.log('API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    console.log('Request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error.response.data?.message || 'An error occurred. Please try again.';
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
    console.log('Fetching products...');
    const { data } = await api.get('/products');
    console.log('Products fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
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
    console.log('Fetching inventory items...');
    const { data } = await api.get('/inventory');
    console.log('Inventory items fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
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