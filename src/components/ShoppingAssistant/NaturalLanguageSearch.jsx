import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useShoppingAssistant } from '../../contexts/ShoppingAssistantContext';

const NaturalLanguageSearch = ({ onSearch, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { trackSearch, preferences } = useShoppingAssistant();
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // Track search for user preferences
    trackSearch(searchTerm);
    
    // Call the parent component's search handler
    onSearch(searchTerm);
    
    // Reset search field
    setSearchTerm('');
    setIsExpanded(false);
  };
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Examples for natural language search prompts
  const searchExamples = [
    "Products for tomato plants",
    "Low toxicity insecticides",
    "Fungicides for fruit trees",
    "Organic fertilizers",
    "Best herbicide for wheat crops"
  ];

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center rounded-full transition-all duration-300 border ${isExpanded ? 'bg-white border-green-500 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
          <div className="pl-4 pr-2">
            <Search size={18} className={`${isExpanded ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder="Describe what you're looking for..."
            className={`w-full py-2.5 pr-4 bg-transparent focus:outline-none text-sm ${isExpanded ? 'text-gray-800' : 'text-gray-600'}`}
          />
          
          {isExpanded && (
            <div className="pr-3 flex items-center">
              <Sparkles size={16} className="text-green-500" />
              <span className="text-xs text-gray-500 ml-1">AI Powered</span>
            </div>
          )}
        </div>
      </form>
      
      {/* Search examples and history dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
          {/* Recent searches */}
          {preferences?.previousSearches?.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1 px-2">Recent Searches</p>
              <div className="space-y-1">
                {preferences.previousSearches.slice(0, 3).map((term, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => {
                      setSearchTerm(term);
                      onSearch(term);
                      setIsExpanded(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search examples */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 mb-1 px-2">Try searching for</p>
            <div className="space-y-1">
              {searchExamples.map((example, index) => (
                <button
                  key={`example-${index}`}
                  onClick={() => {
                    setSearchTerm(example);
                    onSearch(example);
                    setIsExpanded(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                >
                  <Search size={14} className="text-gray-400 mr-2" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageSearch; 