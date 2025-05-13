import axios from 'axios';

const BASE_URL = '/api/analytics';

/**
 * Get dashboard statistics for a specific store
 * @param {string} storeId - The ID of the store to get statistics for
 * @returns {Promise<Object>} The dashboard statistics
 */
export const getDashboardStats = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/dashboard-stats`);
  return response.data;
};

/**
 * Get sales data for a specific store
 * @param {string} storeId - The ID of the store to get sales data for
 * @param {string} period - The time period to get sales data for (week, month, quarter, year)
 * @returns {Promise<Object>} The sales data
 */
export const getSalesData = async (storeId, period = 'year') => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/sales-data`, {
    params: { period }
  });
  return response.data;
};

/**
 * Get inventory distribution for a specific store
 * @param {string} storeId - The ID of the store to get inventory distribution for
 * @returns {Promise<Object>} The inventory distribution
 */
export const getInventoryDistribution = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/inventory-distribution`);
  return response.data;
};

/**
 * Get customer segments for a specific store
 * @param {string} storeId - The ID of the store to get customer segments for
 * @returns {Promise<Object>} The customer segments
 */
export const getCustomerSegments = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/customer-segments`);
  return response.data;
};

/**
 * Get sales forecast for a specific store
 * @param {string} storeId - The ID of the store to get sales forecast for
 * @returns {Promise<Object>} The sales forecast
 */
export const getSalesForecast = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/sales-forecast`);
  return response.data;
};

/**
 * Get low stock products for a specific store
 * @param {string} storeId - The ID of the store to get low stock products for
 * @returns {Promise<Array>} The low stock products
 */
export const getLowStockProducts = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/low-stock`);
  return response.data;
};

/**
 * Get expiring products for a specific store
 * @param {string} storeId - The ID of the store to get expiring products for
 * @returns {Promise<Array>} The expiring products
 */
export const getExpiringProducts = async (storeId) => {
  const response = await axios.get(`${BASE_URL}/store/${storeId}/expiring-products`);
  return response.data;
}; 