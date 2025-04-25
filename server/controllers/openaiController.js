import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Secret Key should be in your environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// @desc    Chat with OpenAI
// @route   POST /api/openai/chat
// @access  Public
const chatWithOpenAI = asyncHandler(async (req, res) => {
  try {
    const { prompt, context, products } = req.body;
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ 
        success: false, 
        message: 'OpenAI integration is not configured on the server.' 
      });
    }
    
    // Add product information to the context if available
    let productContext = '';
    if (products && products.length > 0) {
      productContext = `\nAvailable products information:\n`;
      products.forEach((product, index) => {
        productContext += `Product ${index + 1}: ${product.name}, Category: ${product.category}, ${product.description}${product.recommendedUse ? `, Recommended Use: ${product.recommendedUse}` : ''}${product.toxicityLevel ? `, Toxicity Level: ${product.toxicityLevel}` : ''}\n`;
      });
    }
    
    // Format messages for OpenAI
    let messages = [];
    
    if (Array.isArray(context)) {
      messages = context;
    } else {
      // If context is not provided as expected, create a basic conversation
      messages = [
        {
          role: 'system',
          content: 'You are an agricultural product expert assistant that helps customers find the right pesticides, herbicides, fertilizers, and other agricultural products. Provide helpful, concise advice and recommend specific products when appropriate based on the customer\'s needs.'
        }
      ];
    }
    
    // Add product context and the current prompt to the last system message
    if (productContext) {
      // Find the system message or create one if it doesn't exist
      const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
      if (systemMessageIndex >= 0) {
        messages[systemMessageIndex].content += productContext;
      } else {
        messages.unshift({
          role: 'system',
          content: 'You are an agricultural expert assistant.' + productContext
        });
      }
    }
    
    // Add the current user prompt
    messages.push({
      role: 'user',
      content: prompt
    });
    
    // Make the API call to OpenAI
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo', // Change to gpt-4 for better results if available
        messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract recommended products from AI response
    const aiMessage = response.data.choices[0].message.content;
    
    // Attempt to identify products from the response
    const recommendedProductIds = findRecommendedProducts(aiMessage, products);
    
    // Return the AI response and any identified product recommendations
    res.json({
      success: true,
      message: aiMessage,
      productRecommendations: recommendedProductIds
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error communicating with AI service.' 
    });
  }
});

// Helper function to identify recommended products from the AI response
const findRecommendedProducts = (aiMessage, availableProducts) => {
  if (!availableProducts || availableProducts.length === 0) return [];
  
  const recommendations = [];
  
  // For each product, check if its name appears in the AI message
  availableProducts.forEach(product => {
    if (aiMessage.includes(product.name)) {
      recommendations.push(product.id);
    }
  });
  
  return recommendations;
};

export { chatWithOpenAI }; 