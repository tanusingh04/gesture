// Test connection to backend
export const testBackendConnection = async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Test products API
export const testProductsAPI = async () => {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    console.log('✅ Products API working:', products.length, 'products found');
    return products;
  } catch (error) {
    console.error('❌ Products API failed:', error);
    return null;
  }
};

