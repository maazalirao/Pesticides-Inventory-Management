import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { 
  ArrowRight, 
  Star, 
  Tag, 
  ChevronRight, 
  ShieldCheck, 
  Leaf, 
  Truck, 
  AlertTriangle, 
  Clock, 
  Heart, 
  CheckCircle2, 
  ShoppingCart, 
  Users,
  Sparkles,
  BarChart,
  Phone,
  Package
} from 'lucide-react';
import { getAllStoresProducts } from '../../lib/api.js';

const Homepage = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(localStorage.getItem('selectedStoreId'));
  const [allProducts, setAllProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: "Muhammad Ali",
      role: "Organic Farmer",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      content: "AgriStore's products have helped me increase my crop yield by 30% while staying organic. Their customer service is exceptional!",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      role: "Commercial Grower",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      content: "I've been using AgriStore for my commercial farm for over 2 years. Their products are consistently high quality and reasonably priced.",
      rating: 4
    },
    {
      id: 3,
      name: "Khalid Hassan",
      role: "Fruit Orchard Owner",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      content: "The fungicides from AgriStore saved my orchard during last season's unexpected wet period. Would highly recommend!",
      rating: 5
    }
  ]);
  const [stats, setStats] = useState([
    { id: 1, value: "25,000+", label: "Farmers Served", icon: <Users className="w-6 h-6 text-green-600" /> },
    { id: 2, value: "98%", label: "Satisfaction Rate", icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> },
    { id: 3, value: "200+", label: "Products Available", icon: <ShoppingCart className="w-6 h-6 text-green-600" /> },
    { id: 4, value: "15+", label: "Years Experience", icon: <BarChart className="w-6 h-6 text-green-600" /> }
  ]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ALL products from ALL stores using the working API function
        console.log('Fetching all products from all stores for unified store experience');
        const productsData = await getAllStoresProducts();
        
        // Handle different response formats
        let products = [];
        if (Array.isArray(productsData)) {
          products = productsData;
        } else if (productsData.products && Array.isArray(productsData.products)) {
          products = productsData.products;
        }
        
        console.log(`Total products fetched from all stores: ${products.length}`);
        
        // Store all products for search functionality
        setAllProducts(products);
        
        // Filter featured products or take the first 4 products
        let featured = [];
        if (products.length > 0) {
          // Try to get featured products first
          featured = products.filter(p => p.featured || p.isFeatured);
          
          // If no featured products, take the first 4
          if (featured.length === 0) {
            featured = products.slice(0, Math.min(4, products.length));
          } else {
            // If we have featured products, take up to 4
            featured = featured.slice(0, 4);
          }
        }
        
        setFeaturedProducts(featured);
        console.log(`Featured products set: ${featured.length}`);
        
        // Extract unique categories and count products in each
        const categoriesMap = products.reduce((acc, product) => {
          const category = product.category || 'Other';
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
          image: `https://placehold.co/400x300/${getCategoryColor(category.name)}/FFFFFF/png?text=${encodeURIComponent(category.name)}`,
          count: category.count
        }));
        
        setCategories(transformedCategories);
        console.log(`Categories processed: ${transformedCategories.length}`);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setError('Failed to load products. Please try refreshing the page.');
        
        // Set empty arrays instead of keeping loading state
        setFeaturedProducts([]);
        setCategories([]);
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); // No dependencies - fetch all products regardless of store selection
  
  // Get a color based on category name for placeholder images
  const getCategoryColor = (categoryName) => {
    const colors = {
      'insecticide': '22c55e',
      'herbicide': '3b82f6',
      'fungicide': '8b5cf6',
      'rodenticide': 'f97316',
      'fertilizer': '10b981',
      'seeds': '84cc16',
      'tools': '6b7280',
      'default': '64748b'
    };
    
    const name = (categoryName || '').toLowerCase();
    
    for (const [key, value] of Object.entries(colors)) {
      if (name.includes(key)) {
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
  
  // Handle adding product to cart with authentication check
  const handleAddToCart = (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const success = addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      storeId: product.storeId || product.store?._id || 'default-store', // Include store ID
      quantity: 1
    });
    
    // Show success notification if item was added successfully
    if (success) {
      console.log(`Added ${product.name} to cart`);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Quality Pesticides</span>
                <span className="block text-green-600">For Better Farming</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Protect your crops and increase your yields with our premium selection of pesticides, 
                herbicides, and agricultural products from trusted suppliers across Pakistan.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/store/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10">
                    Shop Now
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/store/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    View Products
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <img 
                    className="w-full" 
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
                    alt="Person spraying pesticide on crops"
                  />
                  <div className="absolute inset-0 bg-green-600 mix-blend-multiply opacity-30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Store Message */}
      <section className="py-8 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AgriStore - Your Complete Agricultural Solution</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Browse our extensive collection of quality pesticides, fertilizers, and agricultural products from trusted suppliers across Pakistan.
            All products available from multiple verified stores.
          </p>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-3">
              Featured Products
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our <span className="text-green-600">Best Sellers</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our top-rated and most popular agricultural products trusted by farmers worldwide.
            </p>
        </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Retry
              </button>
              </div>
          ) : featuredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center shadow-sm">
              <Package size={36} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-800">No Products Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no products available from our stores.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/store/products" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse All Products
                </Link>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className="relative">
                    <Link to={`/store/product/${product._id}`}>
                      <img 
                        src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${encodeURIComponent(product.name || 'Product')}`} 
                        alt={product.name}
                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    </Link>
                    <div className="absolute top-0 right-0 m-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-0 left-0 m-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white/90 backdrop-blur-sm text-gray-800">
                        {product.category || 'Product'}
                      </span>
                    </div>
                    <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-rose-500 transition-colors shadow-md" onClick={(e) => handleAddToCart(product, e)}>
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            size={16}
                            className={`${i < Math.floor(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">({product.reviews || 0} reviews)</span>
                    </div>
                    <Link to={`/store/product/${product._id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-green-600 font-bold text-lg">{formatCurrency(product.price)}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          {(product.stockQuantity || product.quantity || 0) > 10 ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              In Stock
                            </span>
                          ) : (product.stockQuantity || product.quantity || 0) > 0 ? (
                            <span className="flex items-center text-amber-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="flex items-center text-rose-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Check Stock
                            </span>
                          )}
              </div>
            </div>
                      <button 
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link 
              to="/store/products" 
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md font-medium transition-all hover:shadow-lg"
            >
              Browse All Products
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories Section - Modern Grid Layout */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              Product Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Explore Our <span className="text-green-600">Categories</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive range of agricultural solutions to meet all your farming needs.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Desktop Grid - Hidden on Small Screens */}
              <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/store/products?category=${category.name.toLowerCase()}`}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-70 z-10"></div>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white text-xl font-bold group-hover:text-green-300 transition-colors">{category.name}</h3>
                          <p className="text-white/80 text-sm">
                            {category.count} Products
                          </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center transform group-hover:bg-green-500 transition-all duration-300">
                          <ChevronRight className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="sm:hidden overflow-x-auto pb-8 hide-scrollbar">
                <div className="inline-flex space-x-4 px-4">
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      to={`/store/products?category=${category.name.toLowerCase()}`}
                      className="flex-shrink-0 w-80 group relative overflow-hidden rounded-xl shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-70 z-10"></div>
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-48 object-cover" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white text-lg font-bold">{category.name}</h3>
                            <p className="text-white/80 text-xs">
                              {category.count} Products
                            </p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="text-center mt-8">
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 bg-white rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white transition-colors shadow-sm"
                >
                  View All Categories
                  <ChevronRight className="ml-1" size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              The <span className="text-green-600">AgriStore</span> Advantage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing high-quality products and exceptional service to help your farm thrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Tag size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">
                We offer high-quality products at fair prices to help maximize your farm's profitability.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">
                Every product we sell is tested and verified to meet the highest quality standards.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Truck size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Enjoy quick delivery options to ensure you get the products you need when you need them.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Leaf size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Eco-Friendly Options</h3>
              <p className="text-gray-600 text-sm">
                We offer organic and environmentally responsible products for sustainable farming.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section - Modern Grid Layout */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              Product Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Explore Our <span className="text-green-600">Categories</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive range of agricultural solutions to meet all your farming needs.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4" />
              <p>No categories available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Desktop Grid */}
              <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/store/products?category=${category.name.toLowerCase()}`}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-70 z-10"></div>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white text-xl font-bold group-hover:text-green-300 transition-colors">{category.name}</h3>
                          <p className="text-white/80 text-sm">
                            {category.count} Products
                          </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center transform group-hover:bg-green-500 transition-all duration-300">
                          <ChevronRight className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="sm:hidden overflow-x-auto pb-8">
                <div className="inline-flex space-x-4 px-4">
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      to={`/store/products?category=${category.name.toLowerCase()}`}
                      className="flex-shrink-0 w-80 group relative overflow-hidden rounded-xl shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900 opacity-70 z-10"></div>
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-48 object-cover" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white text-lg font-bold">{category.name}</h3>
                            <p className="text-white/80 text-xs">
                              {category.count} Products
                            </p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center">
                            <ChevronRight className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="text-center mt-8">
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 bg-white rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white transition-colors shadow-sm"
                >
                  View All Categories
                  <ChevronRight className="ml-1" size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              The <span className="text-green-600">AgriStore</span> Advantage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing high-quality products and exceptional service to help your farm thrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Tag size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">
                We offer high-quality products at fair prices to help maximize your farm's profitability.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">
                Every product we sell is tested and verified to meet the highest quality standards.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Truck size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Enjoy quick delivery options to ensure you get the products you need when you need them.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group border border-gray-100">
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Leaf size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">Eco-Friendly Options</h3>
              <p className="text-gray-600 text-sm">
                We offer organic and environmentally responsible products for sustainable farming.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What Our <span className="text-green-600">Customers Say</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what farmers and agricultural professionals have to say about AgriStore.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-md relative border border-gray-100">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-green-500" 
                  />
                  <div>
                    <h4 className="text-base font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      size={16}
                      className={`${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-8 shadow-xl text-white max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to Grow Your Farm?</h3>
                <p className="text-green-100 text-lg">
                  Join thousands of farmers who trust AgriStore for their agricultural needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/store/products" 
                  className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center"
              >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Shopping
              </Link>
                <a 
                  href="tel:+92123456789"
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors flex items-center"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 