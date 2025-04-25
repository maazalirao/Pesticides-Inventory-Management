import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create context
const ShoppingAssistantContext = createContext();

// Hook to use context
export const useShoppingAssistant = () => {
  const context = useContext(ShoppingAssistantContext);
  if (!context) {
    throw new Error('useShoppingAssistant must be used within a ShoppingAssistantProvider');
  }
  return context;
};

// Provider component
export const ShoppingAssistantProvider = ({ children }) => {
  const auth = useAuth();
  
  // Use authenticated user ID if available, otherwise use anonymous ID
  // This ensures the assistant works for both logged-in and guest users
  const [anonymousId] = useState(() => {
    const savedId = localStorage.getItem('anonymous_user_id');
    if (savedId) return savedId;
    const newId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', newId);
    return newId;
  });
  
  // Get user ID from auth if available, otherwise use anonymous ID
  const userId = auth?.user?.id || anonymousId;

  // State for user preferences
  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem(`shopping_preferences_${userId}`);
    return savedPreferences ? JSON.parse(savedPreferences) : {
      favoriteCategories: [],
      previousSearches: [],
      viewedProducts: [],
      purchasedProducts: [],
      preferredToxicityLevels: [],
      preferredManufacturers: []
    };
  });

  // State for personalized recommendations
  const [recommendations, setRecommendations] = useState([]);
  
  // State for assistant chat history
  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem(`chat_history_${userId}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // State for controlling chat UI visibility
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`shopping_preferences_${userId}`, JSON.stringify(preferences));
  }, [preferences, userId]);

  // Save chat history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`chat_history_${userId}`, JSON.stringify(chatHistory));
  }, [chatHistory, userId]);

  // Track viewed products - with safety checks
  const trackProductView = (product) => {
    if (!product || !product._id) return;
    
    setPreferences(prev => {
      const updatedViewedProducts = [
        product._id,
        ...prev.viewedProducts.filter(id => id !== product._id)
      ].slice(0, 20); // Keep last 20 viewed products
      
      return {
        ...prev,
        viewedProducts: updatedViewedProducts
      };
    });
  };

  // Track purchased products - with safety checks
  const trackPurchase = (products) => {
    if (!products || !products.length) return;
    
    setPreferences(prev => {
      const purchasedIds = products.map(p => p.id || p._id).filter(Boolean);
      if (!purchasedIds.length) return prev;
      
      const updatedPurchasedProducts = [
        ...purchasedIds,
        ...prev.purchasedProducts
      ].slice(0, 50); // Keep last 50 purchased products
      
      // Update favorite categories based on purchases
      const categories = products.map(p => p.category).filter(Boolean);
      const categoryCount = {};
      
      // Count occurrences of each category
      [...prev.favoriteCategories, ...categories].forEach(cat => {
        if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      // Sort by count and take top 5
      const favoriteCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category)
        .slice(0, 5);
      
      return {
        ...prev,
        purchasedProducts: updatedPurchasedProducts,
        favoriteCategories
      };
    });
  };

  // Track searches - with safety checks
  const trackSearch = (searchTerm) => {
    if (!searchTerm) return;
    
    setPreferences(prev => {
      const updatedSearches = [
        searchTerm,
        ...prev.previousSearches.filter(term => term !== searchTerm)
      ].slice(0, 10); // Keep last 10 searches
      
      return {
        ...prev,
        previousSearches: updatedSearches
      };
    });
  };

  // Add a message to chat history
  const addChatMessage = (message, isUser = true) => {
    if (!message) return;
    
    setChatHistory(prev => [
      ...prev,
      {
        id: Date.now(),
        content: message,
        isUser,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
  };

  // Generate recommendations based on user preferences - with better error handling
  const generateRecommendations = async (products) => {
    try {
      console.log('Generating recommendations from', products?.length || 0, 'products');
      
      if (!products || products.length === 0) {
        console.log('No products available for recommendations');
        return [];
      }

      // Simple recommendation logic based on viewed and purchased products
      const viewedSet = new Set(preferences.viewedProducts);
      const purchasedSet = new Set(preferences.purchasedProducts);
      const favoriteCategories = new Set(preferences.favoriteCategories);
      
      console.log('User preferences:', {
        viewedProducts: preferences.viewedProducts.length,
        purchasedProducts: preferences.purchasedProducts.length,
        favoriteCategories: preferences.favoriteCategories
      });
      
      let recommended = [];
      
      // If user has preferences, use them for recommendations
      if (viewedSet.size > 0 || favoriteCategories.size > 0) {
        recommended = products
          .filter(product => {
            // Don't recommend products already purchased
            if (purchasedSet.has(product._id)) return false;
            
            // Prioritize products in favorite categories
            const categoryMatch = favoriteCategories.has(product.category);
            
            // Prioritize products similar to viewed but not purchased
            const wasViewed = viewedSet.has(product._id);
            
            return categoryMatch || wasViewed;
          });
      }
      
      // If we don't have enough recommendations based on preferences, add popular products
      if (recommended.length < 5) {
        console.log('Not enough personalized recommendations, adding popular products');
        // Filter out products already in recommendations
        const recommendedIds = new Set(recommended.map(p => p._id));
        const popularProducts = products
          .filter(p => !recommendedIds.has(p._id))
          .slice(0, 10 - recommended.length);
        
        recommended = [...recommended, ...popularProducts];
      }
      
      console.log('Generated', recommended.length, 'recommendations');
      setRecommendations(recommended);
      return recommended;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  };

  // Toggle chat assistant visibility
  const toggleAssistant = () => {
    setIsAssistantOpen(prev => !prev);
  };

  const value = {
    preferences,
    recommendations,
    chatHistory,
    isAssistantOpen,
    trackProductView,
    trackPurchase,
    trackSearch,
    addChatMessage,
    clearChatHistory,
    generateRecommendations,
    toggleAssistant,
    setIsAssistantOpen
  };

  return <ShoppingAssistantContext.Provider value={value}>{children}</ShoppingAssistantContext.Provider>;
};

export default ShoppingAssistantContext; 