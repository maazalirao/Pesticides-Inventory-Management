import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, Tag, TrendingUp, ChevronRight, ShieldCheck, Leaf, Truck, AlertTriangle } from 'lucide-react';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products from the database - using the same endpoint as in ProductListing
        const productsResponse = await axios.get('/api/products');
        
        // Filter to only get featured products or limit to recent 4
        let products = productsResponse.data;
        // Either filter featured products or just take the most recent 4
        const featuredProducts = products.filter(p => p.featured).length > 0 
          ? products.filter(p => p.featured).slice(0, 4) 
          : products.slice(0, 4);
        
        setFeaturedProducts(featuredProducts);
        
        // Extract unique categories and count products in each
        const categoriesMap = products.reduce((acc, product) => {
          const category = product.category;
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              name: category
            };
          }
          acc[category].count += 1;
          return acc;
        }, {});
        
        // Transform categories data
        const transformedCategories = Object.values(categoriesMap).map((category, index) => ({
          id: index.toString(),
          name: category.name,
          image: `https://placehold.co/400x300/${getCategoryColor(category.name)}/FFFFFF/png?text=${category.name}`,
          count: category.count
        }));
        
        setCategories(transformedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again.');
        
        // Fallback to mock data if API fails
        setFeaturedProducts([
          { 
            _id: '1', 
            name: "MaxKill Insecticide", 
            category: "Insecticide", 
            description: "Effective against a wide range of insects",
            price: 49.99,
            image: "https://placehold.co/300x300/22c55e/FFFFFF/png?text=MaxKill",
            rating: 4.5,
            reviews: 28,
            stockQuantity: 45,
            featured: true
          },
          { 
            _id: '2', 
            name: "HerbControl Plus", 
            category: "Herbicide", 
            description: "Eliminates weeds while preserving crops",
            price: 38.50,
            image: "https://placehold.co/300x300/3b82f6/FFFFFF/png?text=HerbControl",
            rating: 4.2,
            reviews: 19,
            stockQuantity: 28,
            featured: true
          },
          { 
            _id: '3', 
            name: "WeedBGone", 
            category: "Herbicide", 
            description: "Fast-acting weed elimination solution",
            price: 27.99,
            image: "https://placehold.co/300x300/3b82f6/FFFFFF/png?text=WeedBGone",
            rating: 3.8,
            reviews: 14,
            stockQuantity: 6,
            featured: true
          },
          { 
            _id: '4', 
            name: "FungoClear Solution", 
            category: "Fungicide", 
            description: "Prevents and treats fungal infections in plants",
            price: 65.00,
            image: "https://placehold.co/300x300/8b5cf6/FFFFFF/png?text=FungoClear",
            rating: 4.7,
            reviews: 32,
            stockQuantity: 16,
            featured: true
          }
        ]);
        
        setCategories([
          { 
            id: '1', 
            name: "Insecticides", 
            image: "https://placehold.co/400x300/22c55e/FFFFFF/png?text=Insecticides",
            count: 12
          },
          { 
            id: '2', 
            name: "Herbicides", 
            image: "https://placehold.co/400x300/3b82f6/FFFFFF/png?text=Herbicides",
            count: 8
          },
          { 
            id: '3', 
            name: "Fungicides", 
            image: "https://placehold.co/400x300/8b5cf6/FFFFFF/png?text=Fungicides",
            count: 5
          },
          { 
            id: '4', 
            name: "Rodenticides", 
            image: "https://placehold.co/400x300/f97316/FFFFFF/png?text=Rodenticides",
            count: 4
          }
        ]);
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get a color based on category name for placeholder images
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
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRoLTJWMTZoMnYxOHptNC0yLjVIMjAuNXYtMkgzOHYySDI0eiIvPjwvZz48L3N2Zz4=')] bg-repeat"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                Premium Agricultural Solutions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Grow Better with <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">Quality Products</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Discover our premium range of agricultural products designed to maximize your crop yield and protect your investment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Shop Products
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition duration-300"
                >
                  Explore Categories
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-white">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">P</div>
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">H</div>
                    <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-xs font-bold">I</div>
                  </div>
                  <span className="ml-3 text-sm">Trusted by 2000+ farmers</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-300 mr-1 fill-yellow-300" />
                  <span className="text-sm">4.8/5 rating (350+ reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-full absolute top-4 right-4 rounded-2xl bg-white/10 backdrop-blur-sm"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl overflow-hidden border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img 
                      src="https://images.unsplash.com/photo-1575330933415-cea1e7ce53eb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Insecticide" 
                      className="aspect-square object-cover rounded-lg shadow-lg mb-4 transform hover:scale-105 transition duration-300"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Herbicide" 
                      className="aspect-square object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="pt-8">
                    <img 
                      src="https://www.pomais.com/wp-content/uploads/2025/01/1.jpg" 
                      alt="Agricultural Products" 
                      className="aspect-square object-cover rounded-lg shadow-lg mb-4 transform hover:scale-105 transition duration-300"
                    />
                    <img 
                      src="https://www.pomais.com/wp-content/uploads/2024/08/aluminum-phosphide8.jpg" 
                      alt="Pesticide" 
                      className="aspect-square object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white text-center">
                  <p className="font-medium">Scientifically formulated solutions for your crops</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg className="absolute bottom-0 w-full h-16 text-gray-50" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
              <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,208C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Product Categories
            </span>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Browse Our <span className="text-primary">Product Categories</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of agricultural product categories to find exactly what you need for your specific requirements.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button 
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Grid - Hidden on Small Screens */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/store/products?category=${category.name.toLowerCase()}`}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/90 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                        <h3 className="text-white text-xl font-bold group-hover:text-yellow-300 transition-colors">{category.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-white/80 text-sm">
                            {category.count} Products
                          </p>
                          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Horizontal Scroll - Visible Only on Small Screens */}
              <div className="sm:hidden">
                <div className="relative">
                  {/* Left shadow fade effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Scroll indicators */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex space-x-1">
                      {categories.map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                      ))}
                    </div>
                  </div>

                  <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-4">
                      {categories.map((category) => (
                        <Link 
                          key={category.id} 
                          to={`/store/products?category=${category.name.toLowerCase()}`}
                          className="flex-shrink-0 w-64 relative overflow-hidden rounded-xl shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-36 object-cover" 
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                            <h3 className="text-white text-lg font-bold mb-1">{category.name}</h3>
                            <div className="flex items-center justify-between">
                              <p className="text-white/80 text-xs">
                                {category.count} Products
                              </p>
                              <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center">
                                <ChevronRight className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right shadow fade effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
                </div>
                
                {/* View All Categories button */}
                <div className="text-center mt-6">
                  <Link 
                    to="/store/products" 
                    className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    View All Categories
                    <ChevronRight className="ml-1" size={16} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-3">
              Featured Products
            </span>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Our <span className="text-primary">Best Sellers</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our top-rated and most popular agricultural products that farmers and gardeners trust.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error Loading Products</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button 
                className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Grid - Hidden on Small Screens */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                    <div className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 z-10">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold uppercase py-1 px-3 rounded-bl-lg shadow-md">
                          Featured
                        </div>
                      </div>
                      <Link to={`/store/product/${product._id}`}>
                        <img 
                          src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${product.name}`} 
                          alt={product.name}
                          className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" 
                        />
                      </Link>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">{product.category}</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <Link to={`/store/product/${product._id}`} className="block">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                              strokeWidth={i < Math.floor(product.rating || 0) ? 0 : 2}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviews || 0} reviews)
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <Link 
                          to={`/store/product/${product._id}`}
                          className="inline-flex items-center px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Horizontal Scroll - Visible Only on Small Screens */}
              <div className="sm:hidden">
                <div className="relative">
                  {/* Left shadow fade effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Product scroll indicators */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex space-x-1">
                      {featuredProducts.map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                      ))}
                    </div>
                  </div>

                  <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-4">
                      {featuredProducts.map((product) => (
                        <div key={product._id} className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                          <div className="relative">
                            <div className="absolute top-0 right-0 z-10">
                              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold uppercase py-1 px-3 rounded-bl-lg shadow-md">
                                Featured
                              </div>
                            </div>
                            <Link to={`/store/product/${product._id}`}>
                              <img 
                                src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${product.name}`} 
                                alt={product.name}
                                className="w-full h-48 object-cover" 
                              />
                            </Link>
                            <div className="absolute top-0 left-0 m-2">
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-md bg-white/80 backdrop-blur-sm text-gray-800">
                                {product.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <Link to={`/store/product/${product._id}`}>
                              <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                            </Link>
                            
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                                    strokeWidth={i < Math.floor(product.rating || 0) ? 0 : 2}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({product.reviews || 0})
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-bold text-primary text-lg">
                                {formatCurrency(product.price)}
                              </span>
                              <Link 
                                to={`/store/product/${product._id}`}
                                className="bg-primary text-white text-xs px-3 py-1.5 rounded-md flex items-center"
                              >
                                View <ArrowRight size={14} className="ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right shadow fade effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                </div>
                
                {/* View All Products button */}
                <div className="text-center mt-6">
                  <Link 
                    to="/store/products" 
                    className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    View All Products
                    <ArrowRight className="ml-1" size={16} />
                  </Link>
                </div>
              </div>
            </>
          )}
          
          <div className="hidden sm:block text-center mt-10">
            <Link 
              to="/store/products" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
            >
              View All Products
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mt-20 -mr-32 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full -mb-40 -ml-40 opacity-70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Benefits of <span className="text-primary">Choosing Us</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide high-quality agricultural products with excellent service and support to help you achieve optimal results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mt-16 -mr-16 transition-all duration-300 group-hover:bg-primary/20"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Tag size={32} />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">Competitive Pricing</h3>
                <p className="text-gray-600 mb-6">
                  We offer high-quality products at competitive prices to help maximize your farm's profitability and return on investment.
                </p>
                
                <div className="flex items-center text-primary">
                  <div className="flex items-center">
                    <ShieldCheck size={18} className="mr-2" />
                    <span className="text-sm font-medium">Price Match Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mt-16 -mr-16 transition-all duration-300 group-hover:bg-primary/20"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Leaf size={32} />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">Premium Quality</h3>
                <p className="text-gray-600 mb-6">
                  All our products are sourced from trusted manufacturers and undergo strict quality control processes to ensure effectiveness.
                </p>
                
                <div className="flex items-center text-primary">
                  <div className="flex items-center">
                    <Star size={18} className="mr-2" />
                    <span className="text-sm font-medium">Top-Rated Products</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mt-16 -mr-16 transition-all duration-300 group-hover:bg-primary/20"></div>
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <TrendingUp size={32} />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">Expert Advice</h3>
                <p className="text-gray-600 mb-6">
                  Get personalized advice from our team of agricultural experts with years of experience to help maximize your yields.
                </p>
                
                <div className="flex items-center text-primary">
                  <div className="flex items-center">
                    <Truck size={18} className="mr-2" />
                    <span className="text-sm font-medium">Fast Nationwide Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-primary rounded-xl p-8 shadow-xl text-white max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">Ready to boost your agricultural efficiency?</h3>
                <p className="text-white/80">Join thousands of satisfied farmers using our premium products.</p>
              </div>
              <Link 
                to="/store/products" 
                className="inline-flex items-center whitespace-nowrap px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 