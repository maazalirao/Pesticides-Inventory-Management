import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShoppingCart, Grid3X3, List, Star,
  ChevronDown, Sliders, X, Package, AlertTriangle
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Update category if provided in URL
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }
  }, [categoryParam]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by category
    const categoryMatch = 
      selectedCategory === 'all' || 
      product.category.toLowerCase() === selectedCategory;
    
    // Filter by price
    const priceMatch = 
      product.price >= priceRange[0] * 100 && 
      product.price <= priceRange[1] * 100;
    
    // Filter by search term
    const searchMatch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && priceMatch && searchMatch;
  });
  
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
  
  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
    // Show notification (in a real app, you might use a toast notification)
    alert(`${product.name} added to cart!`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Shop Agricultural Products</h1>
          <p className="text-gray-600 mt-2">
            Browse our selection of high-quality pesticides, herbicides, and more.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Filter Panel */}
          <div className={`fixed inset-0 bg-white z-50 md:hidden transform ${filterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`mobile-category-${category.value}`}
                        name="mobile-category"
                        checked={selectedCategory === category.value}
                        onChange={() => setSelectedCategory(category.value)}
                        className="text-primary rounded-full"
                      />
                      <label htmlFor={`mobile-category-${category.value}`} className="ml-2 text-gray-700">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{formatCurrency(priceRange[0] * 100)}</span>
                    <span>{formatCurrency(priceRange[1] * 100)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 100]);
                    setSortBy('featured');
                  }}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Filter size={16} />
                  Filters
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category.value}`}
                        name="category"
                        checked={selectedCategory === category.value}
                        onChange={() => setSelectedCategory(category.value)}
                        className="text-primary rounded-full"
                      />
                      <label htmlFor={`category-${category.value}`} className="ml-2 text-sm text-gray-700">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{formatCurrency(priceRange[0] * 100)}</span>
                    <span>{formatCurrency(priceRange[1] * 100)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
                className="w-full py-2 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
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
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  <List size={18} />
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  Showing {filteredProducts.length} products
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <AlertTriangle size={36} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Products</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Package size={36} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 100]);
                    setSortBy('featured');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/store/product/${product._id}`}>
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={product.image || "https://placehold.co/300x300/cccccc/FFFFFF/png?text=No+Image"} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/store/product/${product._id}`} className="hover:text-primary">
                          <h3 className="font-medium">{product.name}</h3>
                        </Link>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                          disabled={product.stockQuantity <= 0}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <div key={product._id} className="flex bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/store/product/${product._id}`} className="w-32 sm:w-48 flex-shrink-0">
                      <img 
                        src={product.image || "https://placehold.co/300x300/cccccc/FFFFFF/png?text=No+Image"} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between">
                        <Link to={`/store/product/${product._id}`} className="hover:text-primary">
                          <h3 className="font-medium">{product.name}</h3>
                        </Link>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/store/product/${product._id}`}
                            className="px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
                            disabled={product.stockQuantity <= 0}
                          >
                            <ShoppingCart size={14} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing; 