import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  BarChart2, 
  Store,
  Settings,
  Bell,
  Search,
  User,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Check if device is mobile or screen size is small
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Get current path without the /admin prefix
  const currentPath = location.pathname.replace(/^\/admin/, '');

  // Add isActive function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { 
      title: 'Dashboard', 
      icon: <Home className="h-5 w-5" />, 
      path: '/admin' 
    },
    { 
      title: 'Store Management', 
      icon: <Building2 className="h-5 w-5" />, 
      path: '/admin/stores' 
    },
    { 
      title: 'Inventory', 
      icon: <Package className="h-5 w-5" />, 
      path: '/admin/inventory' 
    },
    { 
      title: 'Products', 
      icon: <ShoppingCart className="h-5 w-5" />, 
      path: '/admin/products' 
    },
    { 
      title: 'Suppliers', 
      icon: <Users className="h-5 w-5" />, 
      path: '/admin/suppliers' 
    },
    { 
      title: 'Customers', 
      icon: <Users className="h-5 w-5" />, 
      path: '/admin/customers' 
    },
    { 
      title: 'Invoices & Billing', 
      icon: <FileText className="h-5 w-5" />, 
      path: '/admin/invoices' 
    },
    { 
      title: 'Reports', 
      icon: <BarChart2 className="h-5 w-5" />, 
      path: '/admin/reports' 
    },
    { 
      title: 'Settings', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/admin/settings' 
    }
  ];

  // Get current page title from navItems
  const currentPageTitle = navItems.find(item => item.path === location.pathname)?.title || 'Dashboard';

  // Handle user dropdown toggle
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const handleLogout = () => {
    // Use auth context logout
    logout();
    // Navigate to login page
    navigate('/admin-login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main sidebar (hidden on mobile, shown when toggled) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Glass effect header with logo */}
        <div className="flex h-20 items-center justify-between px-5 backdrop-blur-sm bg-slate-900/70 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Pesticide Inventory
              </span>
              <div className="flex items-center text-xs text-slate-400 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-orange-500" />
                Admin Dashboard
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 backdrop-blur-sm rounded-full transition-all md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation with categorized sections */}
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)] hide-scrollbar">
          {/* Main navigation - starting immediately after the header */}
          <div className="px-3 pt-6 pb-8">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Main Navigation</div>
            <div className="space-y-1.5">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all",
                    location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-inner" 
                      : "bg-slate-800/40 text-gray-400 group-hover:text-white group-hover:bg-slate-700/50"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  {location.pathname === item.path && (
                    <div className="ml-auto flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white mr-1"></div>
                      <div className="h-1 w-1 rounded-full bg-white/60"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Management section */}
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3 mt-6">Management</div>
            <div className="space-y-1.5">
              {navItems.slice(5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all",
                    location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-inner" 
                      : "bg-slate-800/40 text-gray-400 group-hover:text-white group-hover:bg-slate-700/50"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  {location.pathname === item.path && (
                    <div className="ml-auto flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white mr-1"></div>
                      <div className="h-1 w-1 rounded-full bg-white/60"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer section */}
          <div className="px-6 pt-2 pb-6 border-t border-white/5 mt-2">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Main Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="border-b border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-10 shadow-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white hover:text-orange-500 p-2 rounded-lg hover:bg-slate-700 transition-all md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-3 flex items-center">
                <ShieldCheck className="h-5 w-5 text-orange-500 mr-2 hidden md:inline" />
                <span className="text-lg font-bold text-white hidden md:inline">Admin</span>
                <div className="md:hidden">
                  <span className="text-sm font-medium text-white">Admin Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Theme toggle button */}
              <button 
                onClick={toggleTheme}
                className="text-slate-300 hover:text-orange-500 p-2 rounded-full hover:bg-slate-700 hidden md:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Mobile-friendly search button */}
              <button className="text-slate-300 hover:text-orange-500 p-2 rounded-full hover:bg-slate-700 md:hidden">
                <Search className="h-5 w-5" />
              </button>
              
              {/* User dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center text-slate-300 hover:text-orange-500 p-2 rounded-full hover:bg-slate-700"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </button>
                
                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <div className="text-sm font-medium text-white">{user?.name || 'Admin User'}</div>
                      <div className="text-xs text-slate-400">{user?.username || 'admin'}</div>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/admin/settings" 
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2 text-orange-500" />
                        Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-orange-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6">
          <Outlet />
        </main>
        
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-white/5 z-30 md:hidden">
          <div className="flex justify-around py-2">
            <Link
              key="dashboard"
              to="/admin"
              className={`flex flex-col items-center p-1.5 ${
                isActive('/admin') && location.pathname === '/admin' ? 'text-orange-500' : 'text-white'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Dashboard</span>
            </Link>
            <Link
              key="stores"
              to="/admin/stores"
              className={`flex flex-col items-center p-1.5 ${
                isActive('/admin/stores') ? 'text-orange-500' : 'text-white'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Store Mgmt</span>
            </Link>
            <Link
              key="inventory"
              to="/admin/inventory"
              className={`flex flex-col items-center p-1.5 ${
                isActive('/admin/inventory') ? 'text-orange-500' : 'text-white'
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Inventory</span>
            </Link>
            <Link
              key="products"
              to="/admin/products"
              className={`flex flex-col items-center p-1.5 ${
                isActive('/admin/products') ? 'text-orange-500' : 'text-white'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">Products</span>
            </Link>
            <Link
              key="landing"
              to="/"
              className="flex flex-col items-center p-1.5 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 