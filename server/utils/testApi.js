import fetch from 'node-fetch';

const testApiEndpoints = async (baseUrl) => {
  console.log(`Testing API endpoints at ${baseUrl}...`);
  
  try {
    // Test health endpoint
    console.log('Testing /health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('/health response:', healthData);
    
    // Test API test endpoint
    console.log('Testing /api/test endpoint...');
    const apiTestResponse = await fetch(`${baseUrl}/api/test`);
    const apiTestData = await apiTestResponse.json();
    console.log('/api/test response:', apiTestData);
    
    // Test API server test endpoint
    console.log('Testing /apiserver/test endpoint...');
    const apiServerTestResponse = await fetch(`${baseUrl}/apiserver/test`);
    const apiServerTestData = await apiServerTestResponse.json();
    console.log('/apiserver/test response:', apiServerTestData);
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Error testing API endpoints:', error);
  }
};

// Use from command line with: node testApi.js https://your-railway-app-url.up.railway.app
const baseUrl = process.argv[2] || 'http://localhost:5000';
testApiEndpoints(baseUrl); 