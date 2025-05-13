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
  Wallet,
  Truck,
  Tag,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  DollarSign,
  Box
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeProvider';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';

// Add a style block to hide webkit scrollbar
const scrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const StoreOwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Get the selected store from auth context
  const { selectedStore, stores, selectStore } = useAuth();

  // Check if device is mobile or screen size is small
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
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
      setMobileMenuOpen(false);
    }
  }, [location, isMobile]);

  // Add effect to clear and refresh data when selected store changes
  useEffect(() => {
    if (!selectedStore) return;
    
    console.log('Selected store changed to:', selectedStore.name);
    
    // Clear any cached data for this store to ensure fresh data load
    try {
      if (window.clearStoreSpecificCache) {
        window.clearStoreSpecificCache();
      }
      
      // Trigger refresh of any store-specific data
      const storeChangeEvent = new CustomEvent('storeDataRefresh', { 
        detail: { storeId: selectedStore._id } 
      });
      window.dispatchEvent(storeChangeEvent);
    } catch (error) {
      console.error('Error during store change cache clearing:', error);
      // Continue anyway - the application should work even if caching fails
    }
    
  }, [selectedStore]);

  // Fetch mock notifications
  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      { id: 1, type: 'order', message: 'New order #1234 received', time: '10 min ago', read: false },
      { id: 2, type: 'inventory', message: 'Low stock alert for EcoShield Organic Insecticide', time: '1 hour ago', read: false },
      { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: false },
      { id: 4, type: 'order', message: 'Order #1230 has been shipped', time: '5 hours ago', read: false },
      { id: 5, type: 'payment', message: 'Payment received for order #1228', time: 'Yesterday', read: true },
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const mainNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/storeowner' },
    { icon: <Box size={20} />, label: 'Inventory', path: '/storeowner/inventory' },
    { icon: <Package size={20} />, label: 'Products', path: '/storeowner/products' },
    { icon: <Users size={20} />, label: 'Customers', path: '/storeowner/customers' },
    { icon: <Truck size={20} />, label: 'Suppliers', path: '/storeowner/suppliers' },
  ];

  const managementNavItems = [
    { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/storeowner/orders', badge: '3' },
    { icon: <DollarSign size={20} />, label: 'Sales', path: '/storeowner/sales' },
    { icon: <ClipboardList size={20} />, label: 'Reports', path: '/storeowner/reports' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/storeowner/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  // Handle logout
  const handleLogout = () => {
    // Simple logout by navigating to home
    navigate('/');
  };

  // Handle store change
  const handleStoreChange = (storeId) => {
    // Call the selectStore function from auth context
    // This now includes cache clearing and event dispatching
    const selectedStore = selectStore(storeId);
    
    if (selectedStore) {
      // Force a complete page reload to ensure all components refresh with new store data
      window.location.href = '/storeowner';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Add style tag for custom scrollbar styling */}
      <style>{scrollbarStyle}</style>
      
      {/* Sidebar for desktop */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:block transition-all duration-300 bg-gradient-to-b from-emerald-900 to-emerald-950 text-gray-100 shadow-lg z-20 flex flex-col h-screen`}
      >
        {/* Logo and title - fixed at top */}
        <div className="p-6 flex items-center flex-shrink-0">
          <Box className="h-10 w-10 text-emerald-400 mr-3" />
          <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-opacity`}>
            <h1 className="text-xl font-bold text-emerald-300">Pesticide Inventory</h1>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <User className="h-3 w-3 mr-1" />
              <span>Store Owner Dashboard</span>
            </div>
          </div>
        </div>
        
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ height: 'calc(100vh - 150px)' }}>
          {/* Main Navigation Section */}
          <div className="mt-6">
            <div className={`px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 ${sidebarOpen ? 'block' : 'hidden'}`}>
              MAIN NAVIGATION
            </div>
            <ul className="mt-2">
              {mainNavItems.map((item) => (
                <li key={item.path} className="px-2">
                  <Link
                    to={item.path}
                    className={`flex items-center py-2.5 px-3 rounded-md my-1 transition-colors ${
                      isActive(item.path)
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                    } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  >
                    <span className="p-1">{item.icon}</span>
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    {item.badge && sidebarOpen && (
                      <Badge variant="outline" className="ml-auto bg-emerald-600 text-white border-none">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Management Section */}
          <div className="mt-6">
            <div className={`px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 ${sidebarOpen ? 'block' : 'hidden'}`}>
              MANAGEMENT
            </div>
            <ul className="mt-2">
              {managementNavItems.map((item) => (
                <li key={item.path} className="px-2">
                  <Link
                    to={item.path}
                    className={`flex items-center py-2.5 px-3 rounded-md my-1 transition-colors ${
                      isActive(item.path)
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                    } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  >
                    <span className="p-1">{item.icon}</span>
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    {item.badge && sidebarOpen && (
                      <Badge variant="outline" className="ml-auto bg-emerald-600 text-white border-none">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Store info and selection - fixed at bottom */}
        {sidebarOpen && (
          <div className="p-4 bg-emerald-950/50 rounded-lg m-2 flex-shrink-0 border border-emerald-800/30 backdrop-blur-sm">
            {selectedStore ? (
              <div>
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-emerald-400 mr-2" />
                  <div className="text-sm truncate">{selectedStore.name}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {selectedStore.status === 'active' ? (
                    <span className="text-emerald-400">● Active</span>
                  ) : (
                    <span className="text-red-400">● Inactive</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-300">No store selected</div>
            )}
            
            {stores && stores.length > 0 && (
              <div className="mt-2">
                <label className="text-xs text-gray-400">Switch Store:</label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-1 text-xs text-white bg-emerald-900 border border-emerald-700 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  value={selectedStore?._id || ''}
                  onChange={(e) => handleStoreChange(e.target.value)}
                >
                  {stores.map(store => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {/* Toggle sidebar button */}
        <button
          className="absolute top-20 -right-1 z-30 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 border border-emerald-400/20"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile sidebar/menu */}
      <div 
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-gray-100 shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Menu Header - fixed */}
        <div className="flex justify-between items-center p-4 border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-emerald-400 mr-2" />
            <h1 className="text-lg font-bold text-emerald-300">Pesticide Inventory</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        
        {/* Navigation menus - scrollable */}
        <div className="py-4 overflow-y-auto flex-1 overflow-x-hidden hide-scrollbar">
          <div className="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400">
            MAIN NAVIGATION
          </div>
          <ul className="mt-2">
            {mainNavItems.map((item) => (
              <li key={item.path} className="px-2">
                <Link
                  to={item.path}
                  className={`flex items-center py-2.5 px-3 rounded-md my-1 transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                  }`}
                >
                  <span className="p-1">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto bg-emerald-600 text-white border-none">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="px-4 py-2 mt-4 text-xs font-semibold tracking-wider text-gray-400">
            MANAGEMENT
          </div>
          <ul className="mt-2">
            {managementNavItems.map((item) => (
              <li key={item.path} className="px-2">
                <Link
                  to={item.path}
                  className={`flex items-center py-2.5 px-3 rounded-md my-1 transition-colors ${
                    isActive(item.path)
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                  }`}
                >
                  <span className="p-1">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto bg-emerald-600 text-white border-none">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Mobile store info and selection - fixed at bottom */}
        <div className="p-4 bg-emerald-950/50 mx-2 mb-4 rounded-lg flex-shrink-0 border border-emerald-800/30">
          {selectedStore ? (
            <div>
              <div className="flex items-center">
                <Store className="h-5 w-5 text-emerald-400 mr-2" />
                <div className="text-sm font-medium">{selectedStore.name}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedStore.status === 'active' ? (
                  <span className="text-emerald-400">● Active</span>
                ) : (
                  <span className="text-red-400">● Inactive</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-300">No store selected</div>
          )}
          
          {stores && stores.length > 0 && (
            <div className="mt-2">
              <label className="text-xs text-gray-400">Switch Store:</label>
              <select 
                className="mt-1 block w-full pl-3 pr-10 py-1 text-xs text-white bg-emerald-900 border border-emerald-700 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedStore?._id || ''}
                onChange={(e) => handleStoreChange(e.target.value)}
              >
                {stores.map(store => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
        {/* Top Navigation/Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* Search */}
                <div className="hidden md:flex md:ml-4">
                  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <Search className="h-4 w-4 text-emerald-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="border-none focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent w-64"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 text-gray-500 hover:text-emerald-600 focus:outline-none rounded-full hover:bg-gray-100"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    className="p-1.5 text-gray-500 hover:text-emerald-600 focus:outline-none rounded-full hover:bg-gray-100"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
                
                {/* User menu */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <Avatar className="h-8 w-8 mr-1 border-2 border-emerald-100">
                      <AvatarFallback className="bg-emerald-100 text-emerald-800">SO</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:flex md:items-center">
                      <span className="text-sm font-medium">Store Owner</span>
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </span>
                  </button>
                </div>
                
                {/* Logout button for mobile */}
                <button
                  className="md:hidden p-1.5 text-gray-500 hover:text-red-600 focus:outline-none rounded-full hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreOwnerLayout;