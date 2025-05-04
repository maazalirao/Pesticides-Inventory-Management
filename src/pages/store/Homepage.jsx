import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
  Phone
} from 'lucide-react';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Video Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-700/70 z-10"></div>
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="https://player.vimeo.com/external/517088133.sd.mp4?s=ade3e7eb4df44db472498c2553e4a3b9a89fbdce&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm text-green-300 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Organic & Sustainable Solutions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">Agriculture</span> with Premium Products
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Discover our curated selection of high-quality agricultural solutions designed to maximize yield, protect crops, and promote sustainable farming.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center justify-center px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Shop Products
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link 
                  to="/store/contact" 
                  className="inline-flex items-center justify-center px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition duration-300"
                >
                  <Phone className="mr-2" size={20} />
                  Contact Expert
                </Link>
              </div>
              
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(stat => (
                  <div key={stat.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center text-center">
                    <div className="bg-white/20 rounded-full p-2 mb-2">
                      {stat.icon}
                    </div>
                    <h3 className="text-xl text-white font-bold">{stat.value}</h3>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl overflow-hidden border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1678344170545-c3edef92a16e" 
                      alt="Sustainable Farming" 
                      className="aspect-square object-cover rounded-lg shadow-lg mb-4 transform hover:scale-105 transition duration-300"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Organic Products" 
                      className="aspect-square object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="pt-8">
                    <img 
                      src="https://www.pomais.com/wp-content/uploads/2024/08/aluminum-phosphide8.jpg" 
                      alt="Premium Solutions" 
                      className="aspect-square object-cover rounded-lg shadow-lg mb-4 transform hover:scale-105 transition duration-300"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd" 
                      alt="Pesticide Application" 
                      className="aspect-square object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
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
      
      {/* Featured Products Section - Modern Card Design */}
      <section className="py-16 bg-gray-50">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className="relative">
                    <Link to={`/store/product/${product._id}`}>
                      <img 
                        src={product.image || `https://placehold.co/300x300/${getCategoryColor(product.category)}/FFFFFF/png?text=${product.name}`} 
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
                        {product.category}
                      </span>
                    </div>
                    <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-rose-500 transition-colors shadow-md">
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
                            className={`${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">({product.reviews} reviews)</span>
                    </div>
                    <Link to={`/store/product/${product._id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-green-600 font-bold text-lg">{formatCurrency(product.price)}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          {product.stockQuantity > 10 ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              In Stock
                            </span>
                          ) : product.stockQuantity > 0 ? (
                            <span className="flex items-center text-amber-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="flex items-center text-rose-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center">
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
              <div>
                <h3 className="text-2xl font-bold mb-3">Ready to boost your agricultural efficiency?</h3>
                <p className="text-white/90">Join thousands of satisfied farmers using our premium products.</p>
              </div>
              <Link 
                to="/store/products" 
                className="inline-flex items-center whitespace-nowrap px-6 py-3 bg-white text-green-600 text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 