import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, BarChart2, Lock, ArrowRight, ChevronRight, Check, ShieldCheck } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";

// Add custom styles for the landing page
const landingStyles = {
  wrapper: {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    width: '100%',
    height: '100vh',
    overflowX: 'hidden'
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={landingStyles.wrapper} className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${scrolled ? 'py-3 bg-slate-900/90 backdrop-blur-md shadow-lg' : 'py-6'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Pesticide Inventory
                </span>
                <div className="text-xs text-slate-400 mt-0.5">Management System</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedIn>
                <button 
                  onClick={() => navigate('/admin')} 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </button>
              </SignedIn>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-orange-500/30 flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Admin Login
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2" data-aos="fade-right">
            <div className="inline-block px-4 py-1 bg-orange-500/20 text-orange-300 rounded-full mb-4 font-medium text-sm border border-orange-500/30">
              Seamless Inventory & Store Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Pesticide Inventory <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Management System</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              A comprehensive solution for tracking and managing agricultural chemicals, with both admin dashboard and customer store interfaces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/store" className="group px-6 py-3 bg-white hover:bg-gray-100 text-slate-900 rounded-lg font-semibold transition flex items-center justify-center shadow-lg hover:shadow-white/20">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Visit Store
                <ChevronRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </Link>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Admin Login
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Link to="/admin" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </Link>
              </SignedIn>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-slate-300">Inventory Tracking</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-slate-300">Customer Store</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-slate-300">Analytics</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2" data-aos="fade-left">
            <div className="relative">
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-2xl animate-pulse"></div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/20 rounded-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -left-2 -bottom-2 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/10">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-orange-500/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-orange-500/30 rounded-full blur-2xl"></div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 p-6 rounded-lg hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 flex flex-col items-center text-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:blur-lg transition-all"></div>
                      <ShoppingBag className="h-10 w-10 text-orange-500 relative z-10 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 mt-4">Customer Store</h3>
                    <p className="text-sm text-slate-300">Browse products and place orders online</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-lg hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 flex flex-col items-center text-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:blur-lg transition-all"></div>
                      <BarChart2 className="h-10 w-10 text-orange-500 relative z-10 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 mt-4">Admin Dashboard</h3>
                    <p className="text-sm text-slate-300">Manage inventory, products, and orders</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-lg hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 flex flex-col items-center text-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:blur-lg transition-all"></div>
                      <Package className="h-10 w-10 text-orange-500 relative z-10 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 mt-4">Inventory Management</h3>
                    <p className="text-sm text-slate-300">Track product stock and locations</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-lg hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 flex flex-col items-center text-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:blur-lg transition-all"></div>
                      <Users className="h-10 w-10 text-orange-500 relative z-10 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 mt-4">User Management</h3>
                    <p className="text-sm text-slate-300">Control access and permissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="px-4 py-1 bg-orange-500/20 text-orange-300 rounded-full font-medium text-sm border border-orange-500/30">
            Powerful Features
          </span>
          <h2 className="text-3xl font-bold mt-4">Complete Inventory & Sales Solution</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-300 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <Package className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Inventory Tracking</h3>
            <p className="text-slate-300">Real-time monitoring of product stock levels, locations, and movements. Get alerts for low stock products.</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <ShoppingBag className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Online Store</h3>
            <p className="text-slate-300">Customer-facing storefront for browsing and purchasing products online with a seamless checkout process.</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <BarChart2 className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
            <p className="text-slate-300">Detailed insights into sales, inventory levels, and business performance with exportable reports.</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <ShieldCheck className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Access Control</h3>
            <p className="text-slate-300">Role-based access management ensures that users only access what they need and are authorized to see.</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Integrated Systems</h3>
            <p className="text-slate-300">Seamlessly connects inventory management with online store operations for a unified experience.</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition hover:shadow-lg hover:shadow-orange-500/5 hover:scale-105 group">
            <div className="h-14 w-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Responsive Design</h3>
            <p className="text-slate-300">Access the system from any device - desktop, tablet, or mobile with a fully responsive interface.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-500/10 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Inventory Management?</h2>
            <p className="text-xl text-slate-300 mb-8">Get started today with our comprehensive solution for managing your agricultural products inventory and online store.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/store" className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition shadow-xl flex items-center justify-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explore Store
              </Link>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition shadow-xl flex items-center justify-center">
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Access Admin Dashboard
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Link to="/admin" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition shadow-xl flex items-center justify-center">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-white/10 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Pesticide Inventory
                </span>
                <div className="text-xs text-slate-400 mt-0.5">Management System</div>
              </div>
            </div>
            
            <div className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Pesticide Inventory Management System. All rights reserved.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">About</h3>
              <p className="text-slate-400 text-sm">
                A comprehensive solution for tracking and managing agricultural chemicals, with both admin dashboard and customer store interfaces.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Home</Link></li>
                <li><Link to="/store" className="text-slate-400 hover:text-orange-400 transition-colors">Store</Link></li>
                <li><a href="#features" className="text-slate-400 hover:text-orange-400 transition-colors">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Admin</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <SignedIn>
                    <Link to="/admin" className="text-slate-400 hover:text-orange-400 transition-colors">Dashboard</Link>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-slate-400 hover:text-orange-400 transition-colors text-left">Admin Login</button>
                    </SignInButton>
                  </SignedOut>
                </li>
                <li><Link to="/admin/inventory" className="text-slate-400 hover:text-orange-400 transition-colors">Inventory</Link></li>
                <li><Link to="/admin/products" className="text-slate-400 hover:text-orange-400 transition-colors">Products</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Store</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/store" className="text-slate-400 hover:text-orange-400 transition-colors">Browse Products</Link></li>
                <li><Link to="/store/cart" className="text-slate-400 hover:text-orange-400 transition-colors">Shopping Cart</Link></li>
                <li><Link to="/store/orders" className="text-slate-400 hover:text-orange-400 transition-colors">Order History</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 