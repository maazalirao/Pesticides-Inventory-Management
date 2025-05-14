import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  Leaf, 
  Heart,
  User,
  BarChart2,
  Package,
  ChevronLeft,
  Store,
  Home
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';

const StoreLayout = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Header */}
      <header className={`sticky top-0 z-50 ${scrolled ? 'bg-green-700/95 shadow-md backdrop-blur-sm text-white' : 'bg-gradient-to-br from-green-800 via-green-700 to-green-800 text-white'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/store" className="flex items-center">
                <Leaf size={28} className="text-green-300 mr-2" />
                <span className="text-xl sm:text-2xl font-bold text-white">
                  Agri<span className="text-green-300">Store</span>
                </span>
              </Link>
            </div>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center space-x-8">
              <Link 
                to="/store" 
                className={`whitespace-nowrap px-1 py-1 font-medium transition-colors duration-200 ${isActive('/store') && location.pathname === '/store' ? 'text-green-300' : 'text-white hover:text-green-300'}`}
              >
                Home
              </Link>
              <Link 
                to="/store/products" 
                className={`whitespace-nowrap px-1 py-1 font-medium transition-colors duration-200 ${isActive('/store/products') ? 'text-green-300' : 'text-white hover:text-green-300'}`}
              >
                Products
              </Link>
              <Link 
                to="/store/orders" 
                className={`whitespace-nowrap px-1 py-1 font-medium transition-colors duration-200 ${isActive('/store/orders') ? 'text-green-300' : 'text-white hover:text-green-300'}`}
              >
                Orders
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(!searchOpen)} 
                className="text-white hover:text-green-300 transition-colors duration-200 p-1"
              >
                <Search size={20} />
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/store/cart" className="text-white hover:text-green-300 transition-colors duration-200 p-1 relative">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-400 text-green-900 text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </motion.div>
              
              {isSignedIn ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserButton />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SignInButton mode="modal" redirectUrl={location.pathname}>
                    <button className="flex items-center gap-1 text-white bg-green-600 px-2 py-1.5 rounded-md hover:bg-green-700 transition-all">
                      <User size={16} />
                      <span className="text-xs font-medium">Sign In</span>
                    </button>
                  </SignInButton>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 relative"
            >
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-2 pr-10 bg-white/10 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-white placeholder-green-200"
                autoFocus
              />
              <Search 
                size={18} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300" 
              />
            </motion.div>
          )}
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-white/5"
            >
              <nav className="flex flex-col space-y-3 pt-4">
                <Link 
                  to="/store" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg ${isActive('/store') && location.pathname === '/store' ? 'bg-green-600 text-white font-medium' : 'text-white hover:bg-green-600'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/store/products" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg ${isActive('/store/products') ? 'bg-green-600 text-white font-medium' : 'text-white hover:bg-green-600'}`}
                >
                  Products
                </Link>
                <Link 
                  to="/store/orders" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg ${isActive('/store/orders') ? 'bg-green-600 text-white font-medium' : 'text-white hover:bg-green-600'}`}
                >
                  Orders
                </Link>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-green-800 via-green-700 to-green-800 border-t border-green-600/20 z-30 lg:hidden">
        <div className="flex justify-around py-2">
          <Link
            to="/store"
            className={`flex flex-col items-center p-1.5 ${isActive('/store') && location.pathname === '/store' ? 'text-green-300' : 'text-white'}`}
          >
            <Store size={20} />
            <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Home</span>
          </Link>
          <Link
            to="/store/products"
            className={`flex flex-col items-center p-1.5 ${isActive('/store/products') ? 'text-green-300' : 'text-white'}`}
          >
            <Package size={20} />
            <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Products</span>
          </Link>
          <Link
            to="/store/orders"
            className={`flex flex-col items-center p-1.5 ${isActive('/store/orders') ? 'text-green-300' : 'text-white'}`}
          >
            <ShoppingCart size={20} />
            <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Orders</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-800 via-green-700 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf size={24} className="text-green-300 mr-2" />
                <h3 className="font-bold text-xl">AgriStore</h3>
              </div>
              <p className="text-gray-200 mb-6">
                Your one-stop shop for quality agricultural products and solutions.
              </p>
              <div className="mt-4 flex space-x-3">
                <a href="#" className="bg-green-900 hover:bg-green-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="bg-green-900 hover:bg-green-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="bg-green-900 hover:bg-green-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-300">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/store/products" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/store/products?category=insecticide" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Insecticides
                  </Link>
                </li>
                <li>
                  <Link to="/store/products?category=herbicide" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Herbicides
                  </Link>
                </li>
                <li>
                  <Link to="/store/products?category=fungicide" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Fungicides
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-300">Information</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Main Page
                  </Link>
                </li>
                <li>
                  <Link to="/store/terms" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/store/privacy" className="text-gray-200 hover:text-green-300 transition-colors duration-200 flex items-center">
                    <ChevronRight size={14} className="mr-1 text-green-300" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-300">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-200">
                  123 Agri Lane, Farmville<br />
                  CA 90210, United States
                </li>
                <li className="text-gray-200">+1 (800) 123-4567</li>
                <li className="text-gray-200">support@agristore.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-green-600/20 mt-12 pt-8 text-sm text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2023 AgriStore. All rights reserved.</p>
                <div className="mt-2 flex items-center">
                  <Link to="/" className="text-green-300 hover:text-green-100 flex items-center">
                    <Home size={14} className="mr-1" />
                    <span>Back to Main Site</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <ShieldCheck size={16} className="text-green-300 mr-2" />
                  Secure Payment
                </span>
                <span>|</span>
                <Link to="/store/contact" className="text-gray-200 hover:text-green-300">Contact</Link>
                <span>|</span>
                <Link to="/store/faq" className="text-gray-200 hover:text-green-300">FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout; 