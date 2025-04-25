import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, ShoppingBag, Search, Bot, User } from 'lucide-react';
import { useShoppingAssistant } from '../../contexts/ShoppingAssistantContext';
import { getProducts } from '../../lib/api';
import { getProductRecommendations } from '../../lib/openai';

const ShoppingAssistant = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [activeResponse, setActiveResponse] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [usingAI, setUsingAI] = useState(true);
  const messagesEndRef = useRef(null);
  
  const {
    chatHistory,
    addChatMessage,
    isAssistantOpen,
    toggleAssistant,
    preferences,
    recommendations,
    generateRecommendations,
    trackSearch
  } = useShoppingAssistant();

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
        
        // Generate initial recommendations
        if (products.length > 0) {
          generateRecommendations(products);
        }
      } catch (error) {
        console.error('Failed to load products for shopping assistant:', error);
      }
    };
    
    loadProducts();
  }, [generateRecommendations]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeResponse]);

  // Show assistant welcome message if chat is empty
  useEffect(() => {
    if (chatHistory.length === 0 && isAssistantOpen) {
      const welcomeMessage = "👋 Hi there! I'm your AI-powered agricultural assistant. I can help you find the perfect pesticides, herbicides, fertilizers, and other products tailored to your specific crops and needs. I'm knowledgeable about pest control, plant diseases, and optimal growing practices. What can I help you with today?";
      addChatMessage(welcomeMessage, false);
    }
  }, [chatHistory.length, isAssistantOpen, addChatMessage]);

  // Simulate typing effect for bot responses
  const simulateTypingEffect = (message) => {
    setIsTypingResponse(true);
    setActiveResponse('');
    
    let i = 0;
    const typeChar = () => {
      if (i < message.length) {
        setActiveResponse(prev => prev + message.charAt(i));
        i++;
        // Random typing speed between 15-35ms per character
        const randomDelay = Math.floor(Math.random() * 20) + 15;
        const timeout = setTimeout(typeChar, randomDelay);
        setTypingTimeout(timeout);
      } else {
        setIsTypingResponse(false);
        addChatMessage(message, false);
        setActiveResponse('');
      }
    };
    
    typeChar();
    
    // Cleanup function
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const toggleAIMode = () => {
    setUsingAI(!usingAI);
    
    // Inform the user about the mode change
    const modeMessage = !usingAI 
      ? "I've switched to advanced AI mode. I can now provide more detailed agricultural advice and personalized recommendations."
      : "I've switched to basic mode. I'll provide simpler product matching based on keywords.";
    
    simulateTypingEffect(modeMessage);
  };

  const processWithOpenAI = async (query) => {
    try {
      // Track the search term for preference learning
      trackSearch(query);
      
      // Use OpenAI for advanced natural language understanding
      const aiResult = await getProductRecommendations(query, chatHistory, allProducts);
      
      // Set products recommended by AI
      if (aiResult.productRecommendations && aiResult.productRecommendations.length > 0) {
        // Find the actual product objects from the IDs
        const recommendedProducts = allProducts.filter(product => 
          aiResult.productRecommendations.includes(product._id)
        );
        
        setMatchingProducts(recommendedProducts.length > 0 ? recommendedProducts : allProducts.slice(0, 5));
      } else {
        // Fallback to keyword search if AI didn't identify specific products
        const keywords = query.toLowerCase().split(/\s+/);
        const importantKeywords = keywords.filter(word => 
          word.length > 2 && 
          !['the', 'and', 'for', 'that', 'with', 'this', 'have', 'what', 'find', 'show', 'you', 'can', 'help', 'would', 'could', 'should', 'where', 'when', 'how'].includes(word)
        );
        
        // Match products based on extracted keywords
        const matches = allProducts.filter(product => {
          const productText = `${product.name} ${product.description} ${product.category} ${product.recommendedUse || ''} ${product.toxicityLevel || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
          
          return importantKeywords.some(keyword => productText.includes(keyword));
        });
        
        setMatchingProducts(matches.length > 0 ? matches : allProducts.slice(0, 5));
      }
      
      // Display the AI response with typing effect
      simulateTypingEffect(aiResult.message);
      
    } catch (error) {
      console.error('Error processing with OpenAI:', error);
      // Fallback to simple response in case of errors
      processBasicQuery(query);
    }
  };

  const processBasicQuery = async (query) => {
    // Track the search term for preference learning
    trackSearch(query);
    
    // Simple keyword extraction and matching
    const keywords = query.toLowerCase().split(/\s+/);
    const importantKeywords = keywords.filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'that', 'with', 'this', 'have', 'what', 'find', 'show', 'you', 'can', 'help', 'would', 'could', 'should', 'where', 'when', 'how'].includes(word)
    );
    
    // Match products based on extracted keywords
    const matches = allProducts.filter(product => {
      const productText = `${product.name} ${product.description} ${product.category} ${product.recommendedUse || ''} ${product.toxicityLevel || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
      
      // Product matches if it contains any of the important keywords
      return importantKeywords.some(keyword => productText.includes(keyword));
    });
    
    setMatchingProducts(matches);
    
    // Craft response based on query content
    let responseMessage = '';
    
    // Check if query contains greetings
    if (/^(hi|hello|hey|greetings)/.test(query.toLowerCase())) {
      responseMessage = `Hello! How can I help you find agricultural products today?`;
    }
    // Check if query is about recommendations
    else if (query.toLowerCase().includes('recommend') || query.toLowerCase().includes('suggest')) {
      if (matches.length > 0) {
        responseMessage = `Based on your query, I'd recommend these ${matches.length} products that best match your needs:`;
      } else if (recommendations.length > 0) {
        responseMessage = "Based on your previous activity, I'd recommend these products that might interest you:";
        setMatchingProducts(recommendations);
      } else {
        responseMessage = "I don't have enough information yet to make personalized recommendations. Here are some popular products you might be interested in:";
        setMatchingProducts(allProducts.slice(0, 5));
      }
    }
    // Check if query is asking about specific pest/crop
    else if (query.toLowerCase().includes('pest') || query.toLowerCase().includes('crop') || query.toLowerCase().includes('plant')) {
      if (matches.length > 0) {
        responseMessage = `For your ${query.toLowerCase().includes('pest') ? 'pest control' : 'crop'} needs, I found these ${matches.length} products that could help:`;
      } else {
        responseMessage = `I couldn't find specific products for that need. Please let me know more about your ${query.toLowerCase().includes('pest') ? 'pest problem' : 'crop requirements'} so I can help better.`;
      }
    }
    // Default response for product searches
    else if (matches.length > 0) {
      responseMessage = `I found ${matches.length} products that match your search. Here are the best options:`;
    }
    // Fallback response
    else {
      responseMessage = "I couldn't find exact matches for your search. Here are some popular products that might interest you:";
      // Show some general recommendations
      setMatchingProducts(allProducts.slice(0, 5));
    }
    
    // Add assistant response to chat with typing effect
    simulateTypingEffect(responseMessage);
  };

  const processNaturalLanguageQuery = async (query) => {
    setIsLoading(true);
    
    // Choose processing method based on AI mode setting
    if (usingAI) {
      await processWithOpenAI(query);
    } else {
      await processBasicQuery(query);
    }
    
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isTypingResponse) return;
    
    // Add user message to chat
    addChatMessage(inputValue);
    
    // Process the query
    await processNaturalLanguageQuery(inputValue);
    
    // Clear input
    setInputValue('');
  };

  const handleProductClick = (product) => {
    // Navigate to product detail page
    navigate(`/store/product/${product._id}`);
    
    // Close assistant
    toggleAssistant();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  if (!isAssistantOpen) {
    return (
      <button 
        onClick={toggleAssistant}
        className="fixed bottom-5 right-5 bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 transition-all z-50"
        aria-label="Open Shopping Assistant"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 md:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-green-600 text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">AI Agricultural Expert</h3>
        </div>
        <div className="flex items-center">
          <button 
            onClick={toggleAIMode}
            className="hover:bg-green-700 rounded-full p-1 transition-colors mr-2 text-xs"
            aria-label={usingAI ? "Switch to basic mode" : "Switch to AI mode"}
          >
            {usingAI ? "AI: ON" : "AI: OFF"}
          </button>
          <button 
            onClick={toggleAssistant}
            className="hover:bg-green-700 rounded-full p-1 transition-colors"
            aria-label="Close Shopping Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                {message.isUser ? (
                  <>
                    <User size={12} /> You
                  </>
                ) : (
                  <>
                    <Bot size={12} /> Agri-Assistant
                  </>
                )}
              </div>
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Active typing response */}
        {isTypingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200 rounded-bl-none">
              <div className="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                <Bot size={12} /> Agri-Assistant
              </div>
              {activeResponse}
              <span className="inline-block w-1.5 h-3.5 bg-green-500 ml-0.5 animate-pulse"></span>
            </div>
          </div>
        )}
        
        {/* Product recommendations */}
        {matchingProducts.length > 0 && !isTypingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-white border border-gray-200 rounded-lg p-2 space-y-2">
              <p className="text-sm text-gray-500 font-medium">Product Recommendations:</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {matchingProducts.slice(0, 5).map(product => (
                  <div 
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className="flex items-start p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <ShoppingBag size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{product.category}</p>
                      <p className="text-xs font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
                
                {matchingProducts.length > 5 && (
                  <button 
                    onClick={() => navigate('/store/products')}
                    className="w-full text-xs text-green-600 hover:text-green-700 font-medium p-1"
                  >
                    View all {matchingProducts.length} results
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !isTypingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={usingAI ? "Ask me anything about agricultural products..." : "Ask about agricultural products..."}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          disabled={isLoading || isTypingResponse}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading || isTypingResponse}
          className={`p-2 rounded-lg ${
            !inputValue.trim() || isLoading || isTypingResponse
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ShoppingAssistant;