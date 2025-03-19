import axios from 'axios';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
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
  },
  suppliers: {
    data: null,
    timestamp: 0
  },
  customers: {
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
    const { data } = await api.post('/users/register', { name, email, password });
    
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

// Supplier API calls
export const getSuppliers = async () => {
  try {
    if (isCacheValid('suppliers')) {
      return cache.suppliers.data;
    }
    
    const { data } = await api.get('/suppliers');
    cache.suppliers.data = data;
    cache.suppliers.timestamp = Date.now();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSupplierById = async (id) => {
  try {
    const { data } = await api.get(`/suppliers/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const { data } = await api.post('/suppliers', supplierData);
    cache.suppliers.timestamp = 0; // Invalidate cache
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    cache.suppliers.timestamp = 0; // Invalidate cache
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteSupplier = async (id) => {
  try {
    const { data } = await api.delete(`/suppliers/${id}`);
    cache.suppliers.timestamp = 0; // Invalidate cache
    return data;
  } catch (error) {
    throw error;
  }
};

// Customer API calls
export const getCustomers = async () => {
  try {
    if (isCacheValid('customers')) {
      return cache.customers.data;
    }
    
    const { data } = await api.get('/customers');
    cache.customers.data = data;
    cache.customers.timestamp = Date.now();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const { data } = await api.post('/customers', customerData);
    // Invalidate cache
    cache.customers.timestamp = 0;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const { data } = await api.put(`/customers/${id}`, customerData);
    // Invalidate cache
    cache.customers.timestamp = 0;
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const { data } = await api.delete(`/customers/${id}`);
    // Invalidate cache
    cache.customers.timestamp = 0;
    return data;
  } catch (error) {
    throw error;
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

// Invoice API functions
export const getInvoices = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const getInvoice = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

export const updateInvoiceStatus = async (id, status) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update invoice status');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

export default api; 