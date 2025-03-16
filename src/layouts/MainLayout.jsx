import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeProvider';
import { logout } from '../lib/api';

const MainLayout = ({ children, userInfo, setIsLoggedIn, setUserInfo }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate('/login');
  };

  const navItems = [
    { 
      title: 'Dashboard', 
      icon: <Home className="h-5 w-5" />, 
      path: '/' 
    },
    { 
      title: 'Inventory', 
      icon: <Package className="h-5 w-5" />, 
      path: '/inventory' 
    },
    { 
      title: 'Products', 
      icon: <ShoppingCart className="h-5 w-5" />, 
      path: '/products' 
    },
    { 
      title: 'Suppliers', 
      icon: <Users className="h-5 w-5" />, 
      path: '/suppliers' 
    },
    { 
      title: 'Customers', 
      icon: <Users className="h-5 w-5" />, 
      path: '/customers' 
    },
    { 
      title: 'Invoices & Billing', 
      icon: <FileText className="h-5 w-5" />, 
      path: '/invoices' 
    },
    { 
      title: 'Reports', 
      icon: <BarChart2 className="h-5 w-5" />, 
      path: '/reports' 
    },
    { 
      title: 'Online Store', 
      icon: <Store className="h-5 w-5" />, 
      path: '/store' 
    },
    { 
      title: 'Settings', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/settings' 
    }
  ];

  // Get current page title from navItems
  const currentPageTitle = navItems.find(item => item.path === location.pathname)?.title || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0 ring-1 ring-white/10" : "-translate-x-full"
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
              <div className="text-xs text-slate-400 mt-0.5">Management System</div>
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
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleTheme}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="border-b bg-gradient-to-r from-slate-800 to-slate-900 sticky top-0 z-10 shadow-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white hover:text-orange-300 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-all md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Mobile page title */}
              <div className="flex items-center ml-3 md:hidden">
                <h1 className="text-lg font-medium text-white">{currentPageTitle}</h1>
              </div>
              
              <div className="ml-4 hidden md:block">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="rounded-lg p-2 text-white hover:bg-slate-700 hover:text-orange-300 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Mobile search button */}
              <button 
                className="rounded-lg p-2 text-white hover:bg-slate-700 hover:text-orange-300 transition-all md:hidden"
                onClick={() => {
                  // In a real app, this would open a search modal or expand a search input
                  alert('Search functionality would open here');
                }}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <button 
                className="relative text-white hover:text-orange-300 p-2 rounded-lg hover:bg-slate-700 transition-all"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center text-white shadow-lg">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden text-sm font-medium text-white md:block">Admin</span>
              </div>
            </div>
          </div>
          
          {/* Mobile search bar - collapsible */}
          <div className="px-4 pb-3 md:hidden">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </header>

        {/* Back navigation for mobile */}
        {isMobile && location.pathname !== '/' && (
          <div className="p-3 flex items-center bg-slate-800/10">
            <Link to="/" className="flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-slate-900/10 scrollbar-hide">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 