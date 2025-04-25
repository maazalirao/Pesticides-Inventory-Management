import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Get product recommendations and response from OpenAI
 * @param {string} query - User message/query
 * @param {Array} chatHistory - Previous chat messages
 * @param {Array} products - Available products
 * @returns {Object} - OpenAI response and product recommendations
 */
export const getProductRecommendations = async (query, chatHistory, products) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
      message: query,
      chatHistory: chatHistory.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        recommendedUse: product.recommendedUse || '',
        toxicityLevel: product.toxicityLevel || '',
        tags: product.tags || []
      }))
    });

    return {
      message: response.data.message || "I'm sorry, I couldn't process that request. Please try again.",
      productRecommendations: response.data.recommendedProducts || []
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to get AI recommendations');
  }
};

/**
 * Get personalized insights based on user preferences and behavior
 * @param {Object} userPreferences - User preference data
 * @param {Array} purchaseHistory - User's purchase history
 * @returns {Object} - Personalization insights
 */
export const getPersonalizedInsights = async (userPreferences, purchaseHistory) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/insights`, {
      preferences: userPreferences,
      history: purchaseHistory
    });

    return {
      insights: response.data.insights || [],
      suggestions: response.data.suggestions || []
    };
  } catch (error) {
    console.error('Error getting personalized insights:', error);
    throw new Error('Failed to generate personalized insights');
  }
};

/**
 * Get farming advice based on specific inputs
 * @param {Object} farmingContext - Information about crops, conditions, etc.
 * @returns {Object} - AI farming advice
 */
export const getFarmingAdvice = async (farmingContext) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/farming-advice`, {
      context: farmingContext
    });

    return {
      advice: response.data.advice || "I couldn't generate specific advice based on the provided information.",
      products: response.data.recommendedProducts || []
    };
  } catch (error) {
    console.error('Error getting farming advice:', error);
    throw new Error('Failed to generate farming advice');
  }
}; 