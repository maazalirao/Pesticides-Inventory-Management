import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShoppingCart, Grid3X3, List, Star,
  ChevronDown, Sliders, X, Package, AlertTriangle, 
  ChevronRight, Heart, Leaf, ArrowUpDown, Tag, CheckCircle2,
  Store
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const storeParam = searchParams.get('store');
  
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get selected store from URL param or localStorage, prioritize URL param
        const storeId = storeParam || localStorage.getItem('selectedStoreId');
        console.log('Current storeId:', storeId);
        
        if (storeId) {
          try {
            // Get store details
            const storeResponse = await axios.get(`/api/stores/${storeId}`);
            setSelectedStore(storeResponse.data);
            console.log('Selected store:', storeResponse.data.name);
            
            // Update localStorage with current store
            localStorage.setItem('selectedStoreId', storeId);
            
            // First try to fetch from the public endpoint (which works better on Vercel)
            console.log('Fetching products from public endpoint for store:', storeId);
            try {
              const productsResponse = await axios.get(`/api/public/products`, {
                params: { store: storeId },
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              });
              console.log(`Fetched ${productsResponse.data.length} products using public endpoint`);
              setProducts(productsResponse.data);
            } catch (publicApiError) {
              console.warn('Public API endpoint failed, trying standard endpoint:', publicApiError);
              // Fall back to standard API if public endpoint fails
              const productsResponse = await axios.get(`/api/products`, {
                params: { store: storeId },
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              });
              console.log(`Fetched ${productsResponse.data.length} products using standard endpoint`);
              setProducts(productsResponse.data);
            }
          } catch (err) {
            console.error('Error fetching store data:', err);
            setError('Could not load store information');
            
            // Fallback to fetching all products from public endpoint
            console.log('Falling back to fetching all products from public endpoint');
            try {
              const productResponse = await axios.get('/api/public/products', {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              });
              console.log(`Fetched ${productResponse.data.length} products in fallback mode`);
              setProducts(productResponse.data);
            } catch (publicApiFallbackError) {
              console.warn('Public API fallback failed, trying standard endpoint:', publicApiFallbackError);
              // Final fallback to standard API
              const productResponse = await axios.get('/api/products', {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              });
              console.log(`Fetched ${productResponse.data.length} products using standard endpoint fallback`);
              setProducts(productResponse.data);
            }
          }
        } else {
          // No store selected, fetch all products from public endpoint
          console.log('No store selected, fetching all products from public endpoint');
          try {
            const productResponse = await axios.get('/api/public/products', {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            console.log(`Fetched ${productResponse.data.length} products`);
            setProducts(productResponse.data);
          } catch (publicApiError) {
            console.warn('Public API endpoint failed, trying standard endpoint:', publicApiError);
            // Fall back to standard API
            const productResponse = await axios.get('/api/products', {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            console.log(`Fetched ${productResponse.data.length} products using standard endpoint`);
            setProducts(productResponse.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    
    // Update category if provided in URL
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }
    
    // If store param is provided in URL, update localStorage
    if (storeParam) {
      localStorage.setItem('selectedStoreId', storeParam);
    }
  }, [categoryParam, storeParam]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by category
    const categoryMatch = 
      selectedCategory === 'all' || 
      (product.category && product.category.toLowerCase() === selectedCategory);
    
    // Filter by price
    const priceMatch = 
      product.price >= priceRange[0] * 100 && 
      product.price <= priceRange[1] * 100;
    
    // Filter by search term
    const searchMatch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // We don't need to filter by store anymore as we're fetching store-specific products
    // from the API already
    
    return categoryMatch && priceMatch && searchMatch;
  });
  
  // Debug product data
  useEffect(() => {
    if (products.length > 0) {
      console.log('Products loaded:', products.length);
      console.log('Filtered products:', filteredProducts.length);
      console.log('Selected store:', selectedStore?.name);
      console.log('Selected category:', selectedCategory);
      // Log a sample product to check structure
      console.log('Sample product:', products[0]);
    }
  }, [products, filteredProducts, selectedStore, selectedCategory]);
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });
  
  // Get unique categories from products
  const categories = [
    { value: 'all', label: 'All Categories' },
    ...Array.from(new Set(products.map(product => product.category.toLowerCase())))
      .map(category => ({
        value: category.toLowerCase(),
        label: category.charAt(0).toUpperCase() + category.slice(1)
      }))
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' }
  ];
  
  // Get category color
  const getCategoryColor = (categoryName) => {
    const colors = {
      'insecticide': '22c55e',
      'herbicide': '3b82f6',
      'fungicide': '8b5cf6',
      'rodenticide': 'f97316',
      'default': '64748b'
    };
    
    categoryName = categoryName?.toLowerCase() || '';
    
    for (const [key, value] of Object.entries(colors)) {
      if (categoryName.includes(key)) {
        return value;
      }
    }
    
    return colors.default;
  };
  
  const handleAddToCart = (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
    // No alert notification needed
  };
  
  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="relative py-10 bg-gradient-to-r from-green-800 to-green-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src="https://media.istockphoto.com/id/1950529964/photo/farmer-checking-agricultural-machinery-parts.webp?a=1&b=1&s=612x612&w=0&k=20&c=aujdHnlBhbX5BQNdtUnMBBMaDwC2TrizQBBrHWNzEgg=" 
            alt="Agricultural Machinery Parts" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            {selectedStore && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-green-700 text-xs font-medium mb-4 shadow-sm">
                <Store className="w-3 h-3 mr-1 text-green-700" />
                Browsing {selectedStore.name}
            </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Shop Our Premium <span className="text-green-300">Agricultural Products</span>
            </h1>
            <p className="text-white/90 mb-6 max-w-xl">
              Browse our extensive selection of high-quality pesticides, herbicides, fungicides, and more to maximize your crop yield and protect your investment.
            </p>
            
            <div className="bg-white rounded-lg overflow-hidden relative mt-6 shadow-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-700" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-12 pr-4 py-3 outline-none text-gray-800 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-medium text-gray-800">Products</span>
            {selectedStore && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="font-medium text-green-600">{selectedStore.name}</span>
              </>
            )}
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="font-medium text-green-600">{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="md:hidden flex justify-between items-center mb-4">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-700 text-white' : 'bg-gray-100'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-700 text-white' : 'bg-gray-100'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            {/* Mobile Filter Panel */}
            <div className={`fixed inset-0 bg-white z-50 md:hidden transform ${filterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
              <div className="bg-green-700 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center">
                    <Filter size={18} className="mr-2" />
                    Filter Products
                  </h3>
                  <button onClick={() => setFilterOpen(false)} className="bg-white/20 rounded-full p-1">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`mobile-category-${category.value}`}
                          name="mobile-category"
                          checked={selectedCategory === category.value}
                          onChange={() => setSelectedCategory(category.value)}
                          className="text-green-700 rounded-full"
                        />
                        <label htmlFor={`mobile-category-${category.value}`} className="ml-2 text-gray-700">
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Price Range</h4>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-green-700"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>{formatCurrency(priceRange[0] * 100)}</span>
                      <span>{formatCurrency(priceRange[1] * 100)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-700"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4 border-t flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 100]);
                      setSortBy('featured');
                    }}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full py-2 px-4 bg-green-700 text-white rounded-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4 border border-gray-100">
                <div className="mb-6">
                  <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                    <Filter size={16} className="text-green-700" />
                    Filters
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-sm mb-3 text-gray-800">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`category-${category.value}`}
                          name="category"
                          checked={selectedCategory === category.value}
                          onChange={() => setSelectedCategory(category.value)}
                          className="text-green-700 rounded-full"
                        />
                        <label htmlFor={`category-${category.value}`} className="ml-2 text-sm text-gray-700">
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-sm mb-3 text-gray-800">Price Range</h4>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-green-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatCurrency(priceRange[0] * 100)}</span>
                      <span>{formatCurrency(priceRange[1] * 100)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-sm mb-3 text-gray-800">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-700"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 100]);
                    setSortBy('featured');
                    setSearchTerm('');
                  }}
                  className="w-full py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            
            {/* Product Grid/List */}
            <div className="flex-1">
              {/* Desktop View Options & Sort */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <div className="flex items-center gap-1">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md flex items-center ${viewMode === 'grid' ? 'bg-green-700 text-white' : 'text-gray-600'}`}
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md flex items-center ${viewMode === 'list' ? 'bg-green-700 text-white' : 'text-gray-600'}`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                  <span className="ml-3 text-sm text-gray-500">
                    Showing {filteredProducts.length} products
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700">Sort: </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-green-700"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl border p-8 text-center shadow-sm">
                  <AlertTriangle size={36} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Error Loading Products</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl border p-8 text-center shadow-sm">
                  <Package size={36} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-800">No Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedStore 
                      ? `There are no products available from ${selectedStore.name} that match your current filters.` 
                      : "There are no products that match your current filters."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 100]);
                      setSortBy('featured');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                    {selectedStore && (
                      <Link
                        to="/store"
                        className="px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        Return to Homepage
                      </Link>
                    )}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <motion.div 
                      key={product._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col"
                    >
                      <div className="relative">
                        <Link to={`/store/product/${product._id}`}>
                          <div className="h-56 overflow-hidden">
                            <img 
                              src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${product.name}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                            />
                          </div>
                        </Link>
                        <div className="absolute top-0 left-0 m-3">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white/90 backdrop-blur-sm text-gray-800">
                            {product.category}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-rose-500 transition-colors shadow-md"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                size={14}
                                className={`${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">({product.reviews || 0} reviews)</span>
                        </div>
                        <Link to={`/store/product/${product._id}`} className="hover:text-green-700 transition-colors">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-green-700 font-bold text-lg">{formatCurrency(product.price)}</p>
                            <div className="flex items-center text-xs">
                              {product.stockQuantity > 10 ? (
                                <span className="flex items-center text-green-700">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  In Stock
                                </span>
                              ) : product.stockQuantity > 0 ? (
                                <span className="flex items-center text-amber-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <X className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                            disabled={product.stockQuantity <= 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product) => (
                    <motion.div 
                      key={product._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                    >
                      <div className="relative w-32 sm:w-48 flex-shrink-0">
                        <Link to={`/store/product/${product._id}`}>
                          <img 
                            src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${product.name}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white/90 backdrop-blur-sm text-gray-800">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex justify-between">
                          <Link to={`/store/product/${product._id}`} className="hover:text-green-700 transition-colors">
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                          </Link>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                size={12}
                                className={`${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.reviews || 0})</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">{product.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-green-700 font-bold text-lg">{formatCurrency(product.price)}</span>
                            <div className="text-xs">
                              {product.stockQuantity > 10 ? (
                                <span className="flex items-center text-green-700">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  In Stock
                                </span>
                              ) : product.stockQuantity > 0 ? (
                                <span className="flex items-center text-amber-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <X className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/store/product/${product._id}`}
                              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Details
                            </Link>
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition-colors flex items-center gap-1"
                              disabled={product.stockQuantity <= 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </button>
                            <button className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-rose-500 hover:border-rose-200 transition-colors">
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing; 