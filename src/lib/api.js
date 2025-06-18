import axios from 'axios';

// Determine API base URL
const getBaseUrl = () => {
  // In production (like Vercel), use relative URL path
  if (window.location.hostname !== 'localhost') {
    console.log('Using production API base URL');
    return '/api';
  }
  
  // In development, check if we're using a proxy (default) or API server directly
  const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
  if (useLocalApi) {
    // For development with direct API server connection
    console.log('Using direct API server connection');
    return 'http://localhost:5000/api';
  }
  
  // Default for development with proxy
  console.log('Using proxy API URL');
  return '/api';
};

// Create Axios instance with base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get store ID from localStorage
const getStoreId = () => {
  return localStorage.getItem('selectedStoreId');
};

// Request interceptor to add authentication headers and store ID to all requests
api.interceptors.request.use(
  (config) => {
    // Add request debugging for Vercel deployment
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || {});
    
    // Add JWT token for admin routes authentication
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    // Skip store ID interceptor if explicitly requested (for admin global queries)
    if (config.params && config.params.skipStoreIdInterceptor) {
      // Remove the skipStoreIdInterceptor param to keep the request clean
      delete config.params.skipStoreIdInterceptor;
      return config;
    }
    
    const storeId = getStoreId();
    
    if (storeId) {
      // For GET requests, add storeId as query parameter
      if (config.method === 'get') {
        config.params = config.params || {};
        if (!config.params.storeId) {
          config.params.storeId = storeId;
        }
      } 
      // For other methods, add to request body if it's an object
      else if (config.data && typeof config.data === 'object') {
        if (!config.data.storeId) {
          config.data.storeId = storeId;
        }
      }
      
      // If URL has :storeId placeholder, replace it
      if (config.url && config.url.includes(':storeId')) {
        config.url = config.url.replace(':storeId', storeId);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error or API server not responding');
      throw new Error('Network error. Please check your connection.');
    }
    
    // Log details about the response for debugging
    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data);
    
    // Handle different error types
    if (status === 401 || status === 403) {
      // Clear admin auth tokens on authentication failure
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Check if we're on admin routes and redirect to admin login
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
        return;
      }
      
      throw 'Authentication error. Please log in again.';
    }
    
    // Structured error messages
    if (data && typeof data === 'object') {
      if (data.message) {
        throw data.message;
      } else if (data.error) {
        throw data.error;
      }
    }
    
    // Default error message
    throw 'An error occurred. Please try again.';
  }
);

// Define the cache structure with separate per-store caches
const cache = {
  products: {
    all: { data: null, timestamp: 0 },
    byStore: {}
  },
  inventory: {
    all: { data: null, timestamp: 0 },
    byStore: {}
  },
  suppliers: {
    all: { data: null, timestamp: 0 },
    byStore: {}
  },
  customers: {
    all: { data: null, timestamp: 0 },
    byStore: {}
  },
  orders: {
    all: { data: null, timestamp: 0 },
    byStore: {}
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

// Cache validity duration (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// Check if cache is still valid
const isCacheValid = (type) => {
  return cache[type].all.data !== null && 
    (Date.now() - cache[type].all.timestamp) < CACHE_DURATION;
};

// Check if store-specific cache is still valid
const isStoreCacheValid = (type, storeId) => {
  return cache[type].byStore[storeId]?.data !== null && 
    (Date.now() - cache[type].byStore[storeId]?.timestamp) < CACHE_DURATION;
};

// Check if nested cache is still valid
const isNestedCacheValid = (parentKey, childKey) => {
  return cache[parentKey]?.[childKey]?.data !== null && 
    (Date.now() - cache[parentKey][childKey]?.timestamp) < CACHE_DURATION;
};

// Function to clear all caches for a specific store
const clearStoreCache = (storeId) => {
  if (!storeId) return;
  
  console.log('Clearing cache for store:', storeId);
  
  // Clear cache for each resource type for this specific store
  Object.keys(cache).forEach(resourceType => {
    // Only process resources that have a byStore property
    if (cache[resourceType] && typeof cache[resourceType] === 'object') {
      if (cache[resourceType].byStore) {
        console.log(`Clearing ${resourceType} cache for store ${storeId}`);
        
        // Create the store cache object if it doesn't exist
        if (!cache[resourceType].byStore[storeId]) {
          cache[resourceType].byStore[storeId] = { data: null, timestamp: 0 };
        } else {
          // Reset existing cache
          cache[resourceType].byStore[storeId].data = null;
          cache[resourceType].byStore[storeId].timestamp = 0;
        }
      }
    }
  });
};

// Clear all caches or specific store cache
const clearAllCaches = (storeId = null) => {
  console.log('Clearing caches', storeId ? `for store: ${storeId}` : 'for all stores');
  if (storeId) {
    clearStoreCache(storeId);
  } else {
    // Reset the entire cache
    Object.keys(cache).forEach(resourceType => {
      cache[resourceType].all = { data: null, timestamp: 0 };
      cache[resourceType].byStore = {};
    });
  }
};

// Clear analytics data cache
const clearAnalyticsCache = () => {
  console.log('Clearing analytics cache');
  
  // Reset all analytics cache entries
  Object.keys(cache.analytics).forEach(key => {
    cache.analytics[key] = { data: null, timestamp: 0 };
  });
  
  // Also clear store-specific analytics cache if present
  const storeId = getStoreId();
  if (storeId && cache.analytics.byStore && cache.analytics.byStore[storeId]) {
    cache.analytics.byStore[storeId] = {};
  }
  
  return true;
};

// Clear cache for a specific resource type
const clearCache = (resourceType) => {
  console.log(`Clearing cache for ${resourceType}`);
  
  if (!cache[resourceType]) {
    console.warn(`Cache for ${resourceType} not found`);
    return false;
  }
  
  // Reset the all cache
  cache[resourceType].all = { data: null, timestamp: 0 };
  
  // Reset store-specific cache if a store is selected
  const storeId = getStoreId();
  if (storeId && cache[resourceType].byStore) {
    cache[resourceType].byStore[storeId] = { data: null, timestamp: 0 };
  }
  
  return true;
};

// Make cache clearing functions globally available
window.clearStoreSpecificCache = () => clearAllCaches(localStorage.getItem('selectedStoreId'));
window.clearAllCaches = clearAllCaches;
window.storeDataCache = cache;

// Add event listener for store change events
window.addEventListener('storeChanged', (event) => {
  const { storeId } = event.detail;
  console.log('Store changed event detected:', storeId);
  clearStoreCache(storeId);
  console.log('Cache cleared due to store change event for:', storeId);
});

// Utility functions for common API operations
export const fetchData = async (endpoint, params = {}) => {
  try {
    // Make sure storeId is included in requests if it's needed
    const storeId = getStoreId();
    if (storeId && !params.storeId) {
      params.storeId = storeId;
    }
    
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const postData = async (endpoint, data = {}) => {
  try {
    // Make sure storeId is included in requests if it's needed
    const storeId = getStoreId();
    if (storeId && !data.storeId) {
      data.storeId = storeId;
    }
    
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    throw error;
  }
};

export const updateData = async (endpoint, data = {}) => {
  try {
    // Make sure storeId is included in requests if it's needed
    const storeId = getStoreId();
    if (storeId && !data.storeId) {
      data.storeId = storeId;
    }
    
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}:`, error);
    throw error;
  }
};

export const deleteData = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);
    throw error;
  }
};

// Store-specific API functions

// Products
export const getProducts = () => fetchData('/products');
export const getProduct = (id) => fetchData(`/products/${id}`);
export const createProduct = (data) => postData('/products', data);
export const updateProduct = (id, data) => updateData(`/products/${id}`, data);
export const deleteProduct = (id) => deleteData(`/products/${id}`);

// Inventory
export const getInventory = () => fetchData('/inventory/store/:storeId');
export const getInventoryItems = getInventory; // Alias for getInventory
export const getInventoryItem = (id) => fetchData(`/inventory/store/:storeId/${id}`);
export const createInventoryItem = (data) => postData('/inventory/store/:storeId', data);
export const updateInventoryItem = (id, data) => updateData(`/inventory/store/:storeId/${id}`, data);
export const deleteInventoryItem = (id) => deleteData(`/inventory/store/:storeId/${id}`);
export const addBatchToInventoryItem = (id, batchData) => postData(`/inventory/store/:storeId/${id}/batches`, batchData);

// Customers
export const getCustomers = (storeId) => {
  if (!storeId) {
    console.error('No store ID provided to getCustomers');
    return Promise.resolve([]);
  }
  console.log(`Fetching customers for store: ${storeId}`);
  return fetchData(`/customers/store/${storeId}`, { storeId })
    .then(data => {
      // Return data in the most appropriate format based on what the API returns
      if (Array.isArray(data)) {
        // If we get an array directly, ensure it only contains this store's customers
        return data.filter(customer => 
          customer.store === storeId || 
          customer.store?._id === storeId
        );
      } else if (data && data.customers && Array.isArray(data.customers)) {
        // If we get a nested customers object, filter for this store's customers
        return data.customers.filter(customer => 
          customer.store === storeId || 
          customer.store?._id === storeId
        );
      }
      // Return empty array if no valid data
      return [];
    });
};

export const getCustomer = (id) => fetchData(`/customers/store/:storeId/${id}`);
export const createCustomer = (data) => postData('/customers/store/:storeId', data);
export const updateCustomer = (id, data) => updateData(`/customers/store/:storeId/${id}`, data);
export const deleteCustomer = (id) => deleteData(`/customers/store/:storeId/${id}`);

// Suppliers
export const getSuppliers = (storeId) => {
  if (!storeId) {
    console.error('No store ID provided to getSuppliers');
    return Promise.resolve([]);
  }
  console.log(`Fetching suppliers for store: ${storeId}`);
  return fetchData(`/suppliers/store/${storeId}`, { storeId })
    .then(data => {
      // Return data in the most appropriate format based on what the API returns
      if (Array.isArray(data)) {
        // If we get an array directly, ensure it only contains this store's suppliers
        return data.filter(supplier => 
          supplier.store === storeId || 
          supplier.store?._id === storeId
        );
      } else if (data && data.suppliers && Array.isArray(data.suppliers)) {
        // If we get a nested suppliers object, filter for this store's suppliers
        return data.suppliers.filter(supplier => 
          supplier.store === storeId || 
          supplier.store?._id === storeId
        );
      }
      // Return empty array if no valid data
      return [];
    });
};

export const getSupplier = (id) => fetchData(`/suppliers/store/:storeId/${id}`);
export const createSupplier = (data) => postData('/suppliers/store/:storeId', data);
export const updateSupplier = (id, data) => updateData(`/suppliers/store/:storeId/${id}`, data);
export const deleteSupplier = (id) => deleteData(`/suppliers/store/:storeId/${id}`);

// Analytics
export const getDashboardStats = () => fetchData('/analytics/store/:storeId/dashboard-stats');
export const getSalesData = (period) => fetchData('/analytics/store/:storeId/sales-data', { period });
export const getInventoryDistribution = () => fetchData('/analytics/store/:storeId/inventory-distribution');
export const getCustomerSegments = () => fetchData('/analytics/store/:storeId/customer-segments');
export const getSalesForecast = () => fetchData('/analytics/store/:storeId/sales-forecast');
export const getLowStockProducts = () => fetchData('/analytics/store/:storeId/low-stock');
export const getExpiringProducts = () => fetchData('/analytics/store/:storeId/expiring-products');
export const getRecentSales = () => fetchData('/analytics/store/:storeId/recent-sales');

// Invoices 
export const getInvoices = () => fetchData('/invoices/store/:storeId');
export const createInvoice = (data) => postData('/invoices/store/:storeId', data);
export const updateInvoice = (id, data) => updateData(`/invoices/store/:storeId/${id}`, data);
export const deleteInvoice = (id) => deleteData(`/invoices/store/:storeId/${id}`);
export const updateInvoiceStatus = (id, status) => updateData(`/invoices/store/:storeId/${id}/status`, { status });

// Orders
export const getOrders = () => fetchData('/orders/store/:storeId');
export const getOrder = (id) => fetchData(`/orders/store/:storeId/${id}`);
export const createOrder = (data) => postData('/orders/store/:storeId', data);
export const updateOrder = (id, data) => updateData(`/orders/store/:storeId/${id}`, data);
export const deleteOrder = (id) => deleteData(`/orders/store/:storeId/${id}`);
export const updateOrderStatus = (id, status) => updateData(`/orders/store/:storeId/${id}/status`, { status });

// Reports
export const getSalesReport = (dateRange) => fetchData('/reports/store/:storeId/sales', { dateRange });
export const getInventoryReport = () => fetchData('/reports/store/:storeId/inventory');
export const getProductSalesReport = (dateRange) => fetchData('/reports/store/:storeId/product-sales', { dateRange });
export const getCustomerReport = () => fetchData('/reports/store/:storeId/customers');
export const getExpiryReport = () => fetchData('/reports/store/:storeId/expiry');
export const exportReport = (reportType, dateRange) => fetchData('/reports/store/:storeId/export', { reportType, dateRange }, { responseType: 'blob' });

export { clearAnalyticsCache, clearCache };

// Helper function to get all stores
export const getAllStores = async () => {
  try {
    console.log('Fetching all stores...');
    
    // First try the /stores endpoint
    try {
      const response = await api.get('/stores', {
        params: { skipStoreIdInterceptor: true }
      });
      console.log('All stores response:', response.data);
      
      // Check and normalize the response format
      if (Array.isArray(response.data)) {
        return { stores: response.data };
      }
      return response.data;
    } catch (error) {
      console.log('Primary stores endpoint failed, trying admin endpoint');
      
      // Try admin endpoint as fallback
      const adminResponse = await api.get('/admin/stores', {
        params: { skipStoreIdInterceptor: true }
      });
      
      if (Array.isArray(adminResponse.data)) {
        return { stores: adminResponse.data };
      }
      return adminResponse.data;
    }
  } catch (error) {
    console.error('Error fetching all stores:', error);
    
    // If all attempts fail, return empty array to prevent cascading errors
    return { stores: [] };
  }
};

// Admin API functions to fetch data from all stores
export const getAllStoresProducts = async () => {
  try {
    console.log('Fetching all products from all stores...');
    
    // Try multiple endpoint patterns
    let response = null;
    
    // Try different URL patterns in order
    const endpointsToTry = [
      '/admin/products/all',
      '/products/admin/all',
      '/admin/all/products',
      '/admin/all'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint, {
          params: { skipStoreIdInterceptor: true }
        });
        
        if (response && response.data) {
          console.log(`Got response from ${endpoint}:`, response.data);
          break; // We got a response, exit the loop
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        // Continue to the next endpoint
      }
    }
    
    // If we got a response from one of the endpoints
    if (response && response.data) {
      // Check if the data is in the expected format, if not, format it properly
      if (response.data && !response.data.products && Array.isArray(response.data)) {
        console.log('Data is an array, wrapping in expected format');
        return { products: response.data, stores: [] };
      }
      
      // Ensure we have valid array properties
      if (response.data) {
        if (!response.data.products || !Array.isArray(response.data.products)) {
          console.log('No products array found, creating empty array');
          response.data.products = [];
        }
        if (!response.data.stores || !Array.isArray(response.data.stores)) {
          console.log('No stores array found, creating empty array');
          response.data.stores = [];
        }
        
        console.log(`Found ${response.data.products.length} products from admin endpoint`);
        return response.data;
      }
    }
    
    // If we reach here, all endpoints failed - fallback to store-by-store fetching
    console.log('All admin endpoints failed, falling back to store-by-store fetching');
    
    // Get all stores first
    const storesData = await getAllStores();
    const stores = storesData.stores || [];
    
    // Then fetch products for each store
    const allProductsPromises = stores.map(store => {
      return api.get('/products', {
        params: { storeId: store._id }
      }).then(res => {
        // Add store info to each product
        const products = res.data.products || res.data || [];
        return products.map(product => ({
          ...product,
          store: {
            _id: store._id,
            name: store.name
          }
        }));
      }).catch(err => {
        console.error(`Error fetching products for store ${store.name}:`, err);
        return [];
      });
    });
    
    const productsArrays = await Promise.all(allProductsPromises);
    const allProducts = productsArrays.flat();
    
    console.log(`Total products fetched from individual stores: ${allProducts.length}`);
    return { products: allProducts, stores };
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

export const getAllStoresInventory = async () => {
  try {
    console.log('Fetching all inventory from all stores...');
    
    // Try multiple endpoint variations to find the one that works
    let response;
    let error;
    
    // Try multiple endpoints in order
    const endpointsToTry = [
      '/admin/inventory/all',
      '/inventory/admin/all',
      '/admin/all/inventory',
      '/inventory/admin',
      '/admin/all'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint, {
          params: { skipStoreIdInterceptor: true }
        });
        
        if (response && response.data) {
          console.log(`Got response from ${endpoint}:`, response.data);
          break; // We got a response, exit the loop
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        error = err;
        // Continue to the next endpoint
      }
    }
    
    // If we got a response from one of the endpoints
    if (response && response.data) {
      console.log('Processing admin inventory data response');
      
      // Check if the data is in the expected format, if not, format it properly
      if (response.data && !response.data.inventory && Array.isArray(response.data)) {
        console.log('Data is an array of inventory items, wrapping in expected format');
        return { inventory: response.data, stores: [] };
      }
      
      // Ensure we have valid array properties
      if (response.data) {
        if (!response.data.inventory || !Array.isArray(response.data.inventory)) {
          console.log('No inventory array found or not an array, searching for alternative arrays in response');
          
          // Look for any array properties in the response that might contain inventory data
          const possibleArrays = Object.entries(response.data)
            .filter(([key, value]) => Array.isArray(value) && value.length > 0)
            .sort(([, a], [, b]) => b.length - a.length); // Sort by array length (descending)
          
          if (possibleArrays.length > 0) {
            const [arrayKey, arrayValue] = possibleArrays[0];
            console.log(`Found possible inventory array with key "${arrayKey}" and length ${arrayValue.length}`);
            response.data.inventory = arrayValue;
          } else {
            console.log('No suitable array found in response, creating empty inventory array');
            response.data.inventory = [];
          }
        } else {
          console.log(`Found inventory array with ${response.data.inventory.length} items`);
        }
        
        if (!response.data.stores || !Array.isArray(response.data.stores)) {
          console.log('No stores array found, creating empty array');
          response.data.stores = [];
        }
      }
      
      console.log(`Returning inventory data with ${response.data.inventory?.length || 0} items`);
      return response.data;
    }
    
    // If we reach here, all endpoints failed - fallback to store-by-store fetching
    console.log('All admin endpoints failed, falling back to store-by-store fetching');
    
    // Get all stores first
    const storesData = await getAllStores();
    const stores = storesData.stores || [];
    
    console.log(`Fetching inventory for ${stores.length} individual stores`);
    
    // Then fetch inventory for each store
    const allInventoryPromises = stores.map(store => {
      return api.get(`/inventory/store/${store._id}`, {
        params: { storeId: store._id }
      }).then(res => {
        // Add store info to each inventory item
        const inventory = res.data.inventory || res.data || [];
        console.log(`Got ${inventory.length} inventory items from store ${store.name}`);
        return inventory.map(item => ({
          ...item,
          store: {
            _id: store._id,
            name: store.name
          }
        }));
      }).catch(err => {
        console.error(`Error fetching inventory for store ${store.name}:`, err);
        return [];
      });
    });
    
    const inventoryArrays = await Promise.all(allInventoryPromises);
    const allInventory = inventoryArrays.flat();
    
    console.log(`Total inventory items from all stores: ${allInventory.length}`);
    
    return { inventory: allInventory, stores };
  } catch (finalError) {
    console.error('Error in getAllStoresInventory:', finalError);
    // Return an empty result rather than throwing error
    return { inventory: [], stores: [] };
  }
};

export const getAllStoresSuppliers = async () => {
  try {
    console.log('Fetching all suppliers from all stores...');
    
    // Try multiple endpoint patterns
    let response = null;
    
    // Try different URL patterns in order
    const endpointsToTry = [
      '/admin/suppliers/all',
      '/suppliers/admin/all',
      '/admin/all/suppliers',
      '/admin/all'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint, {
          params: { skipStoreIdInterceptor: true }
        });
        
        if (response && response.data) {
          console.log(`Got response from ${endpoint}:`, response.data);
          break; // We got a response, exit the loop
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        // Continue to the next endpoint
      }
    }
    
    // If we got a response from one of the endpoints
    if (response && response.data) {
      // Check if the data is in the expected format, if not, format it properly
      if (response.data && !response.data.suppliers && Array.isArray(response.data)) {
        console.log('Data is an array, wrapping in expected format');
        return { suppliers: response.data, stores: [] };
      }
      
      // Ensure we have valid array properties
      if (response.data) {
        if (!response.data.suppliers || !Array.isArray(response.data.suppliers)) {
          console.log('No suppliers array found, creating empty array');
          response.data.suppliers = [];
        }
        if (!response.data.stores || !Array.isArray(response.data.stores)) {
          console.log('No stores array found, creating empty array');
          response.data.stores = [];
        }
        
        console.log(`Found ${response.data.suppliers.length} suppliers from admin endpoint`);
        return response.data;
      }
    }
    
    // If we reach here, all endpoints failed - fallback to store-by-store fetching
    console.log('All admin endpoints failed, falling back to store-by-store fetching');
    
    // Get all stores first
    const storesData = await getAllStores();
    const stores = storesData.stores || [];
    
    // Then fetch suppliers for each store
    const allSuppliersPromises = stores.map(store => {
      return api.get(`/suppliers/store/${store._id}`, {
        params: { storeId: store._id }
      }).then(res => {
        // Add store info to each supplier
        const suppliers = res.data.suppliers || res.data || [];
        return suppliers.map(supplier => ({
          ...supplier,
          store: {
            _id: store._id,
            name: store.name
          }
        }));
      }).catch(err => {
        console.error(`Error fetching suppliers for store ${store.name}:`, err);
        return [];
      });
    });
    
    const suppliersArrays = await Promise.all(allSuppliersPromises);
    const allSuppliers = suppliersArrays.flat();
    
    console.log(`Total suppliers fetched from individual stores: ${allSuppliers.length}`);
    return { suppliers: allSuppliers, stores };
  } catch (error) {
    console.error('Error fetching all suppliers:', error);
    throw error;
  }
};

export const getAllStoresCustomers = async () => {
  try {
    console.log('Fetching all customers from all stores...');
    
    // Try multiple endpoint patterns
    let response = null;
    
    // Try different URL patterns in order
    const endpointsToTry = [
      '/admin/customers/all',
      '/customers/admin/all',
      '/admin/all/customers',
      '/admin/all'
    ];
    
    // Try each endpoint until one works
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint, {
          params: { skipStoreIdInterceptor: true }
        });
        
        if (response && response.data) {
          console.log(`Got response from ${endpoint}:`, response.data);
          break; // We got a response, exit the loop
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
        // Continue to the next endpoint
      }
    }
    
    // If we got a response from one of the endpoints
    if (response && response.data) {
      // Check if the data is in the expected format, if not, format it properly
      if (response.data && !response.data.customers && Array.isArray(response.data)) {
        console.log('Data is an array, wrapping in expected format');
        return { customers: response.data, stores: [] };
      }
      
      // Ensure we have valid array properties
      if (response.data) {
        if (!response.data.customers || !Array.isArray(response.data.customers)) {
          console.log('No customers array found, creating empty array');
          response.data.customers = [];
        }
        if (!response.data.stores || !Array.isArray(response.data.stores)) {
          console.log('No stores array found, creating empty array');
          response.data.stores = [];
        }
        
        console.log(`Found ${response.data.customers.length} customers from admin endpoint`);
        return response.data;
      }
    }
    
    // If we reach here, all endpoints failed - fallback to store-by-store fetching
    console.log('All admin endpoints failed, falling back to store-by-store fetching');
    
    // Get all stores first
    const storesData = await getAllStores();
    const stores = storesData.stores || [];
    
    // Then fetch customers for each store
    const allCustomersPromises = stores.map(store => {
      return api.get(`/customers/store/${store._id}`, {
        params: { storeId: store._id }
      }).then(res => {
        // Add store info to each customer
        const customers = res.data.customers || res.data || [];
        return customers.map(customer => ({
          ...customer,
          store: {
            _id: store._id,
            name: store.name
          }
        }));
      }).catch(err => {
        console.error(`Error fetching customers for store ${store.name}:`, err);
        return [];
      });
    });
    
    const customersArrays = await Promise.all(allCustomersPromises);
    const allCustomers = customersArrays.flat();
    
    console.log(`Total customers fetched from individual stores: ${allCustomers.length}`);
    return { customers: allCustomers, stores };
  } catch (error) {
    console.error('Error fetching all customers:', error);
    throw error;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    console.log('Fetching admin dashboard stats from all stores...');
    
    // Try the direct admin endpoint first
    try {
      const response = await api.get('/admin/analytics/dashboard-stats', {
        params: { skipStoreIdInterceptor: true }
      });
      console.log('Admin dashboard stats response from admin endpoint:', response.data);
      return response.data;
    } catch (error) {
      console.log('Admin stats endpoint failed, generating aggregate stats from individual stores');
      
      // Fallback: Get all stores first
      const storesData = await getAllStores();
      const stores = storesData.stores || [];
      
      // Get stats from each store and combine them
      const allStatsPromises = stores.map(store => {
        return api.get(`/analytics/store/${store._id}/dashboard-stats`, {
          params: { storeId: store._id }
        }).then(res => {
          return {
            ...res.data,
            store: {
              _id: store._id,
              name: store.name
            }
          };
        }).catch(err => {
          console.error(`Error fetching stats for store ${store.name}:`, err);
          return null;
        });
      });
      
      const allStoreStats = (await Promise.all(allStatsPromises)).filter(Boolean);
      
      // Aggregate stats from all stores to create global stats
      const aggregateStats = {
        statistics: [
          {
            title: "Total Inventory",
            value: allStoreStats.reduce((sum, stat) => {
              const inventoryCount = stat.statistics?.find(s => s.title.includes("Inventory"))?.value || "0";
              return sum + parseInt(inventoryCount.replace(/,/g, ""), 10);
            }, 0).toLocaleString(),
            description: "Total pesticide products across all stores",
            icon: "Package",
            iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
            change: "+5% from last month",
            changeType: "positive"
          },
          {
            title: "Low Stock Items",
            value: allStoreStats.reduce((sum, stat) => {
              const lowStockCount = stat.statistics?.find(s => s.title.includes("Low Stock"))?.value || "0";
              return sum + parseInt(lowStockCount.replace(/,/g, ""), 10);
            }, 0).toLocaleString(),
            description: "Products below minimum threshold",
            icon: "AlertTriangle",
            iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
            change: "-10% from last month",
            changeType: "positive"
          },
          {
            title: "Total Revenue",
            value: `₨ ${allStoreStats.reduce((sum, stat) => {
              const salesStr = stat.statistics?.find(s => s.title.includes("Sales"))?.value || "₨ 0";
              const salesNum = parseInt(salesStr.replace(/[^\d]/g, ""), 10);
              return sum + salesNum;
            }, 0).toLocaleString()}`,
            description: "Combined revenue from all stores",
            icon: "DollarSign",
            iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
            change: "+12% from last month",
            changeType: "positive"
          },
          {
            title: "Total Orders",
            value: allStoreStats.reduce((sum, stat) => {
              const ordersCount = stat.statistics?.find(s => s.title.includes("Orders"))?.value || "0";
              return sum + parseInt(ordersCount.replace(/,/g, ""), 10);
            }, 0).toLocaleString(),
            description: "Combined orders across all stores",
            icon: "ShoppingCart",
            iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
            change: "+8% from last month",
            changeType: "positive"
          }
        ],
        stores: stores,
        // Combine other data as needed
        lowStockProducts: allStoreStats.flatMap(stat => 
          (stat.lowStockProducts || []).map(product => ({
            ...product,
            store: stat.store
          }))
        ),
        expiringProducts: allStoreStats.flatMap(stat => 
          (stat.expiringProducts || []).map(product => ({
            ...product,
            store: stat.store
          }))
        ),
        recentSales: allStoreStats.flatMap(stat => 
          (stat.recentSales || []).map(sale => ({
            ...sale,
            store: stat.store
          }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      };
      
      return aggregateStats;
    }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

export default api; 

// Store management API functions
export const createStore = async (data) => {
  try {
    console.log('Creating new store:', data);
    const response = await api.post('/stores', data, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

export const updateStore = async (id, data) => {
  try {
    console.log('Updating store:', id, data);
    const response = await api.put(`/stores/${id}`, data, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

export const deleteStore = async (id) => {
  try {
    console.log('Deleting store:', id);
    const response = await api.delete(`/stores/${id}`, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

export const getStore = async (id) => {
  try {
    console.log('Getting store:', id);
    const response = await api.get(`/stores/${id}`, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting store:', error);
    throw error;
  }
};

// Store owner management API functions
export const createStoreOwner = async (storeId, userData) => {
  try {
    console.log('Creating store owner for store:', storeId, userData);
    const response = await api.post(`/stores/${storeId}/owner`, userData, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating store owner:', error);
    throw error;
  }
};

export const updateStoreOwner = async (storeId, userData) => {
  try {
    console.log('Creating/Updating store owner for store:', storeId, userData);
    const response = await api.post(`/stores/${storeId}/owner`, userData, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating/updating store owner:', error);
    if (error.response?.data?.message) {
      throw error.response.data.message;
    }
    throw 'Failed to create/update store owner';
  }
};

// Function to get store dashboard data for admin viewing
export const getStoreDashboardData = async (storeId) => {
  try {
    console.log('Getting store dashboard data for admin:', storeId);
    
    // Fetch all dashboard data for a specific store
    const [
      dashboardStats,
      products,
      inventory,
      customers,
      suppliers,
      orders
    ] = await Promise.allSettled([
      api.get(`/analytics/store/${storeId}/dashboard-stats`),
      api.get(`/products`, { params: { storeId } }),
      api.get(`/inventory/store/${storeId}`),
      api.get(`/customers/store/${storeId}`),
      api.get(`/suppliers/store/${storeId}`),
      api.get(`/orders/store/${storeId}`)
    ]);

    // Process results and handle any failures gracefully
    const processResult = (result, fallback = []) => {
      if (result.status === 'fulfilled') {
        return result.value.data;
      } else {
        console.warn('Failed to fetch data:', result.reason);
        return fallback;
      }
    };

    return {
      stats: processResult(dashboardStats, {}),
      products: processResult(products, []),
      inventory: processResult(inventory, []),
      customers: processResult(customers, []),
      suppliers: processResult(suppliers, []),
      orders: processResult(orders, [])
    };
  } catch (error) {
    console.error('Error getting store dashboard data:', error);
    throw error;
  }
};

// Admin inventory management functions
export const createInventoryItemAdmin = async (storeId, data) => {
  try {
    console.log('Creating inventory item for store:', storeId, data);
    const response = await api.post(`/inventory/store/${storeId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryItemAdmin = async (storeId, itemId, data) => {
  try {
    console.log('Updating inventory item:', storeId, itemId, data);
    const response = await api.put(`/inventory/store/${storeId}/${itemId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItemAdmin = async (storeId, itemId) => {
  try {
    console.log('Deleting inventory item:', storeId, itemId);
    const response = await api.delete(`/inventory/store/${storeId}/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

// Admin product management functions  
export const createProductAdmin = async (storeId, data) => {
  try {
    console.log('Creating product for store:', storeId, data);
    const response = await api.post(`/products`, { ...data, storeId });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProductAdmin = async (storeId, productId, data) => {
  try {
    console.log('Updating product:', storeId, productId, data);
    const response = await api.put(`/products/${productId}`, { ...data, storeId });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProductAdmin = async (storeId, productId) => {
  try {
    console.log('Deleting product:', storeId, productId);
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Admin customer management functions
export const createCustomerAdmin = async (storeId, data) => {
  try {
    console.log('Creating customer for store:', storeId, data);
    const response = await api.post(`/customers/store/${storeId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomerAdmin = async (storeId, customerId, data) => {
  try {
    console.log('Updating customer:', storeId, customerId, data);
    const response = await api.put(`/customers/store/${storeId}/${customerId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomerAdmin = async (storeId, customerId) => {
  try {
    console.log('Deleting customer:', storeId, customerId);
    const response = await api.delete(`/customers/store/${storeId}/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Admin supplier management functions
export const createSupplierAdmin = async (storeId, data) => {
  try {
    console.log('Creating supplier for store:', storeId, data);
    const response = await api.post(`/suppliers/store/${storeId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

export const updateSupplierAdmin = async (storeId, supplierId, data) => {
  try {
    console.log('Updating supplier:', storeId, supplierId, data);
    const response = await api.put(`/suppliers/store/${storeId}/${supplierId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

export const deleteSupplierAdmin = async (storeId, supplierId) => {
  try {
    console.log('Deleting supplier:', storeId, supplierId);
    const response = await api.delete(`/suppliers/store/${storeId}/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

// Store Request Management API functions
export const getStoreRequests = async () => {
  try {
    console.log('Getting all store requests');
    const response = await api.get('/store-requests', {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting store requests:', error);
    throw error;
  }
};

export const createStoreRequest = async (requestData) => {
  try {
    console.log('Creating store request:', requestData);
    const response = await api.post('/store-requests', requestData, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating store request:', error);
    throw error;
  }
};

export const updateStoreRequest = async (requestId, updateData) => {
  try {
    console.log('Updating store request:', requestId, updateData);
    const response = await api.put(`/store-requests/${requestId}`, updateData, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating store request:', error);
    throw error;
  }
};

export const approveStoreRequest = async (requestId, ownerCredentials = null) => {
  try {
    console.log('Approving store request:', requestId, ownerCredentials);
    const response = await api.post(`/store-requests/${requestId}/approve`, 
      { ownerCredentials }, 
      {
        params: { skipStoreIdInterceptor: true }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving store request:', error);
    if (error.response?.data?.message) {
      throw error.response.data.message;
    }
    throw 'Failed to approve store request';
  }
};

export const rejectStoreRequest = async (requestId, rejectionReason) => {
  try {
    console.log('Rejecting store request:', requestId, rejectionReason);
    const response = await api.post(`/store-requests/${requestId}/reject`, 
      { rejectionReason },
      {
        params: { skipStoreIdInterceptor: true }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting store request:', error);
    if (error.response?.data?.message) {
      throw error.response.data.message;
    }
    throw 'Failed to reject store request';
  }
};

export const deleteStoreRequest = async (requestId) => {
  try {
    console.log('Deleting store request:', requestId);
    const response = await api.delete(`/store-requests/${requestId}`, {
      params: { skipStoreIdInterceptor: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting store request:', error);
    throw error;
  }
}; 