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
  },
  analytics: {
    dashboardStats: {
      data: null,
      timestamp: 0
    },
    salesData: {
      data: null,
      timestamp: 0
    },
    inventoryDistribution: {
      data: null,
      timestamp: 0
    },
    customerSegments: {
      data: null,
      timestamp: 0
    },
    salesForecast: {
      data: null,
      timestamp: 0
    },
    lowStock: {
      data: null,
      timestamp: 0
    },
    expiringProducts: {
      data: null,
      timestamp: 0
    },
    recentSales: {
      data: null,
      timestamp: 0
    }
  }
};

// Helper function to check if cache is valid
const isCacheValid = (key) => {
  return cache[key]?.data && (Date.now() - cache[key].timestamp < CACHE_DURATION);
};

// Helper function to check if nested cache is valid
const isNestedCacheValid = (parentKey, childKey) => {
  return cache[parentKey]?.[childKey]?.data && 
    (Date.now() - cache[parentKey][childKey].timestamp < CACHE_DURATION);
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
    throw error.response?.data?.message || 'Failed to fetch supplier';
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const { data } = await api.post('/suppliers', supplierData);
    cache.suppliers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create supplier';
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    cache.suppliers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update supplier';
  }
};

export const deleteSupplier = async (id) => {
  try {
    const { data } = await api.delete(`/suppliers/${id}`);
    cache.suppliers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete supplier';
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
    throw error.response?.data?.message || 'Failed to fetch customer';
  }
};

export const createCustomer = async (customerData) => {
  try {
    const { data } = await api.post('/customers', customerData);
    cache.customers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create customer';
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const { data } = await api.put(`/customers/${id}`, customerData);
    cache.customers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update customer';
  }
};

export const deleteCustomer = async (id) => {
  try {
    const { data } = await api.delete(`/customers/${id}`);
    cache.customers.data = null; // Invalidate cache
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete customer';
  }
};

// Cache management
export const clearCache = (key) => {
  if (key) {
    if (cache[key]) {
      cache[key].data = null;
      cache[key].timestamp = 0;
    }
  } else {
    Object.keys(cache).forEach(cacheKey => {
      cache[cacheKey].data = null;
      cache[cacheKey].timestamp = 0;
    });
  }
};

// Invoice API calls
export const getInvoices = async () => {
  try {
    const response = await api.get('/invoices');
    // The server returns { success: true, data: [...] } so we need to extract the data property
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error.response?.data?.message || 'Failed to fetch invoices';
  }
};

export const getInvoice = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw error.response?.data?.message || 'Failed to fetch invoice';
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error.response?.data?.message || 'Failed to create invoice';
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error.response?.data?.message || 'Failed to update invoice';
  }
};

export const deleteInvoice = async (id) => {
  try {
    const response = await api.delete(`/invoices/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw error.response?.data?.message || 'Failed to delete invoice';
  }
};

export const updateInvoiceStatus = async (id, status) => {
  try {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating invoice ${id} status:`, error);
    throw error.response?.data?.message || 'Failed to update invoice status';
  }
};

// Analytics API calls
export const getDashboardStats = async () => {
  try {
    // Check cache first
    if (isNestedCacheValid('analytics', 'dashboardStats')) {
      return cache.analytics.dashboardStats.data;
    }
    
    const { data } = await api.get('/analytics/dashboard-stats');
    
    // Update cache
    cache.analytics.dashboardStats.data = data;
    cache.analytics.dashboardStats.timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getSalesData = async (period = 'year') => {
  try {
    // We don't cache this to ensure fresh data based on period parameter
    const { data } = await api.get(`/analytics/sales-data?period=${period}`);
    return data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

export const getInventoryDistribution = async () => {
  try {
    // Check cache first
    if (isNestedCacheValid('analytics', 'inventoryDistribution')) {
      return cache.analytics.inventoryDistribution.data;
    }
    
    const { data } = await api.get('/analytics/inventory-distribution');
    
    // Update cache
    cache.analytics.inventoryDistribution.data = data;
    cache.analytics.inventoryDistribution.timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching inventory distribution:', error);
    throw error;
  }
};

export const getCustomerSegments = async () => {
  try {
    // Check cache first
    if (isNestedCacheValid('analytics', 'customerSegments')) {
      return cache.analytics.customerSegments.data;
    }
    
    const { data } = await api.get('/analytics/customer-segments');
    
    // Update cache
    cache.analytics.customerSegments.data = data;
    cache.analytics.customerSegments.timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    throw error;
  }
};

export const getSalesForecast = async () => {
  try {
    // Check cache first
    if (isNestedCacheValid('analytics', 'salesForecast')) {
      return cache.analytics.salesForecast.data;
    }
    
    const { data } = await api.get('/analytics/sales-forecast');
    
    // Update cache
    cache.analytics.salesForecast.data = data;
    cache.analytics.salesForecast.timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching sales forecast:', error);
    throw error;
  }
};

export const getLowStockProducts = async () => {
  try {
    // This changes frequently, so we use a shorter cache time
    const shortCacheDuration = 2 * 60 * 1000; // 2 minutes
    const cacheKey = 'lowStock';
    
    if (
      cache.analytics[cacheKey]?.data && 
      (Date.now() - cache.analytics[cacheKey].timestamp < shortCacheDuration)
    ) {
      return cache.analytics[cacheKey].data;
    }
    
    const { data } = await api.get('/analytics/low-stock');
    
    // Update cache
    cache.analytics[cacheKey].data = data;
    cache.analytics[cacheKey].timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

export const getExpiringProducts = async () => {
  try {
    // Check cache first
    if (isNestedCacheValid('analytics', 'expiringProducts')) {
      return cache.analytics.expiringProducts.data;
    }
    
    const { data } = await api.get('/analytics/expiring-products');
    
    // Update cache
    cache.analytics.expiringProducts.data = data;
    cache.analytics.expiringProducts.timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    throw error;
  }
};

export const getRecentSales = async () => {
  try {
    // This changes frequently, so we use a shorter cache time
    const shortCacheDuration = 2 * 60 * 1000; // 2 minutes
    const cacheKey = 'recentSales';
    
    if (
      cache.analytics[cacheKey]?.data && 
      (Date.now() - cache.analytics[cacheKey].timestamp < shortCacheDuration)
    ) {
      return cache.analytics[cacheKey].data;
    }
    
    const { data } = await api.get('/analytics/recent-sales');
    
    // Update cache
    cache.analytics[cacheKey].data = data;
    cache.analytics[cacheKey].timestamp = Date.now();
    
    return data;
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    throw error;
  }
};

// Clear specific analytics cache
export const clearAnalyticsCache = (key) => {
  if (key && cache.analytics[key]) {
    cache.analytics[key].data = null;
    cache.analytics[key].timestamp = 0;
    console.log(`Analytics cache cleared for ${key}`);
  } else {
    // Clear all analytics cache
    Object.keys(cache.analytics).forEach(k => {
      cache.analytics[k].data = null;
      cache.analytics[k].timestamp = 0;
    });
    console.log('All analytics cache cleared');
  }
};

export default api; 