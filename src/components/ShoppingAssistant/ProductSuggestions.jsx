import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingAssistant } from '../../contexts/ShoppingAssistantContext';
import { Sparkle, Tag, Leaf } from 'lucide-react';
import axios from 'axios';

const ProductSuggestions = ({ limit = 4 }) => {
  const navigate = useNavigate();
  const { recommendations } = useShoppingAssistant();
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch popular products as fallback if no recommendations
  useEffect(() => {
    const fetchPopularProducts = async () => {
      if (recommendations && recommendations.length > 0) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        // Just use the first few products as "popular" for now
        setPopularProducts(response.data.slice(0, limit));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching popular products:', error);
        setLoading(false);
      }
    };
    
    fetchPopularProducts();
  }, [recommendations, limit]);
  
  // Determine which products to display - recommendations or popular fallback
  const productsToDisplay = recommendations && recommendations.length > 0 
    ? recommendations 
    : popularProducts;
  
  // Return null if no products available and still loading
  if (productsToDisplay.length === 0) {
    if (loading) {
      return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading recommendations...</p>
        </div>
      );
    }
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const getToxicityBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-green-50 border-b border-gray-100 flex items-center">
        <Sparkle size={18} className="text-green-600 mr-2" />
        <h3 className="font-medium text-gray-900">
          {recommendations && recommendations.length > 0 ? 'Suggested for You' : 'Popular Products'}
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {productsToDisplay.slice(0, limit).map((product) => (
          <div 
            key={product._id}
            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => navigate(`/store/product/${product._id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Leaf size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                <p className="text-gray-500 text-xs line-clamp-2 mt-1">{product.description}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs flex items-center gap-1">
                      <Tag size={12} className="text-gray-400" />
                      <span className="text-gray-500">{product.category}</span>
                    </span>
                    
                    {product.toxicityLevel && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getToxicityBadgeColor(product.toxicityLevel)}`}>
                        {product.toxicityLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {productsToDisplay.length > limit && (
        <div className="p-3 border-t border-gray-100 text-center">
          <button 
            onClick={() => navigate('/store/products')}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View all {recommendations && recommendations.length > 0 ? 'recommendations' : 'products'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSuggestions; 