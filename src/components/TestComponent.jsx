import React, { useState, useEffect } from 'react';
import { getProducts, getInventoryItems } from '../lib/api';

const TestComponent = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        setApiStatus('Testing API connection...');
        
        // Test products endpoint
        const productsData = await getProducts();
        setProducts(productsData);
        
        // Test inventory endpoint
        const inventoryData = await getInventoryItems();
        setInventory(inventoryData);
        
        setApiStatus('API connection successful!');
      } catch (err) {
        console.error('API Test Error:', err);
        setApiStatus('API connection failed');
        setError(err.message || 'Unknown error');
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Connection Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Status: <span style={{ color: apiStatus.includes('successful') ? 'green' : apiStatus.includes('Testing') ? 'orange' : 'red' }}>{apiStatus}</span></h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Products ({products.length})</h2>
          {products.length > 0 ? (
            <ul>
              {products.slice(0, 5).map(product => (
                <li key={product._id}>{product.name}</li>
              ))}
              {products.length > 5 && <li>...and {products.length - 5} more</li>}
            </ul>
          ) : (
            <p>No products found</p>
          )}
        </div>
        
        <div style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Inventory ({inventory.length})</h2>
          {inventory.length > 0 ? (
            <ul>
              {inventory.slice(0, 5).map(item => (
                <li key={item._id}>{item.name}</li>
              ))}
              {inventory.length > 5 && <li>...and {inventory.length - 5} more</li>}
            </ul>
          ) : (
            <p>No inventory items found</p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Debug Information</h2>
        <p>API URL: {import.meta.env.PROD ? window.location.origin + '/api' : import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
        <p>Environment: {import.meta.env.PROD ? 'Production' : 'Development'}</p>
      </div>
    </div>
  );
};

export default TestComponent; 