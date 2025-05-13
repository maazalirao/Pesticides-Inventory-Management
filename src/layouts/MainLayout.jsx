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
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeProvider';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
      title: 'Online Store', 
      icon: <Store className="h-5 w-5" />, 
      path: '/admin/store' 
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
    // Simple logout - just navigate to home
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Mobile Nav - Icon only sidebar (Always visible on mobile) */}
      <div className="fixed left-0 top-0 bottom-0 z-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-16 md:hidden flex flex-col items-center pt-24 pb-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                location.pathname === item.path
                  ? "text-orange-500" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-xl",
                location.pathname === item.path 
                  ? "bg-white/10 text-orange-500" 
                  : "hover:bg-white/5"
              )}>
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.title.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main sidebar (collapsible on mobile) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0 ring-1 ring-white/10" : "-translate-x-full",
          "md:block hidden" // Hide on mobile, replaced by icon bar
        )}
      >
        {/* Glass effect header with logo */}
        <div className="flex h-24 items-center justify-between px-6 backdrop-blur-sm bg-slate-900/70 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
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
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)] scrollbar-hide">
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

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-10 shadow-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-200 hover:text-orange-500 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 flex items-center">
                <ShieldCheck className="h-5 w-5 text-orange-500 mr-2 hidden md:inline" />
                <span className="text-lg font-bold text-white hidden md:inline">Admin</span>
                <div className="flex items-center md:hidden">
                  <ShieldCheck className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-xs font-medium text-slate-200">Admin Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:flex">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-white/10 text-sm text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 w-48 focus:bg-white/20"
                />
              </div>
              
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-300 hover:text-orange-500 rounded-lg hover:bg-white/10 transition-all"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-slate-300 hover:text-orange-500 rounded-lg hover:bg-white/10 transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-slate-900"></span>
              </button>
              
              {/* User menu */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-slate-200">Admin User</div>
                    <div className="text-xs text-slate-400">admin@example.com</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <div className="text-sm font-medium text-slate-200">Admin User</div>
                      <div className="text-xs text-slate-400">admin@example.com</div>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/admin/settings" 
                        className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-orange-500"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-orange-500 w-full text-left"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Add left padding on mobile to account for icon sidebar */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="container mx-auto py-6 px-4 md:px-6 pl-20 md:pl-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 