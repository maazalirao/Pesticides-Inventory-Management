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
import { useAdminAuth } from '../contexts/AdminAuthContext';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Get the admin user and stores from auth context
  const { adminUser, logout } = useAdminAuth();
  
  // Get selected store from localStorage or first assigned store
  const getSelectedStore = () => {
    const storedStore = localStorage.getItem('selectedStore');
    if (storedStore) {
      try {
        return JSON.parse(storedStore);
      } catch (error) {
        console.error('Error parsing stored store:', error);
      }
    }
    return adminUser?.stores?.[0] || null;
  };
  
  const selectedStore = getSelectedStore();
  const stores = adminUser?.stores || [];

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

  // Check for pending orders when selectedStore changes
  useEffect(() => {
    const updateOrdersCount = () => {
      if (selectedStore && selectedStore._id) {
        // Get store-specific orders from localStorage
        const storeOrdersKey = `store_orders_${selectedStore._id}`;
        const savedOrders = JSON.parse(localStorage.getItem(storeOrdersKey) || '[]');
        
        // Count only pending or processing orders
        const pendingOrders = savedOrders.filter(order => 
          order.status === 'pending' || order.status === 'processing'
        );
        
        setPendingOrdersCount(pendingOrders.length);
      } else {
        setPendingOrdersCount(0);
      }
    };
    
    // Initial count
    updateOrdersCount();
    
    // Listen for changes to orders
    window.addEventListener('ordersUpdated', updateOrdersCount);
    
    // Listen for store changes
    window.addEventListener('storeChanged', updateOrdersCount);
    
    return () => {
      window.removeEventListener('ordersUpdated', updateOrdersCount);
      window.removeEventListener('storeChanged', updateOrdersCount);
    };
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

  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/storeowner' },
    { title: 'Inventory', icon: <Package className="h-5 w-5" />, path: '/storeowner/inventory' },
    { title: 'Products', icon: <ShoppingCart className="h-5 w-5" />, path: '/storeowner/products' },
    { title: 'Orders', icon: <ShoppingBag className="h-5 w-5" />, path: '/storeowner/orders', badge: pendingOrdersCount > 0 ? pendingOrdersCount.toString() : null },
    { title: 'Customers', icon: <Users className="h-5 w-5" />, path: '/storeowner/customers' },
    { title: 'Suppliers', icon: <Truck className="h-5 w-5" />, path: '/storeowner/suppliers' },
    { title: 'Sales', icon: <DollarSign className="h-5 w-5" />, path: '/storeowner/sales' },
    { title: 'Reports', icon: <BarChart2 className="h-5 w-5" />, path: '/storeowner/reports' },
    { title: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/storeowner/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  // Handle logout
  const handleLogout = () => {
    logout(); // Use admin auth logout
  };

  // Handle store change
  const handleStoreChange = (storeId) => {
    const newSelectedStore = stores.find(store => store._id === storeId);
    
    if (newSelectedStore) {
      // Update localStorage
      localStorage.setItem('selectedStoreId', storeId);
      localStorage.setItem('selectedStore', JSON.stringify(newSelectedStore));
      
      // Force a complete page reload to ensure all components refresh with new store data
      window.location.href = '/storeowner';
    }
  };

  // Handle user dropdown toggle
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Add style tag for custom scrollbar styling */}
      <style>{scrollbarStyle}</style>
      
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
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 shadow-2xl transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Glass effect header with logo */}
        <div className="flex h-20 items-center justify-between px-5 backdrop-blur-sm bg-emerald-900/70 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Pesticide Inventory
              </span>
              <div className="flex items-center text-xs text-slate-400 mt-0.5">
                <Store className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                Store Owner Dashboard
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
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)] hide-scrollbar">
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
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all",
                    location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-inner" 
                      : "bg-emerald-800/40 text-gray-400 group-hover:text-white group-hover:bg-emerald-700/50"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto bg-white/20 text-white border-none">
                      {item.badge}
                    </Badge>
                  )}
                  {location.pathname === item.path && !item.badge && (
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
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all",
                    location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-inner" 
                      : "bg-emerald-800/40 text-gray-400 group-hover:text-white group-hover:bg-emerald-700/50"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto bg-white/20 text-white border-none">
                      {item.badge}
                    </Badge>
                  )}
                  {location.pathname === item.path && !item.badge && (
                    <div className="ml-auto flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white mr-1"></div>
                      <div className="h-1 w-1 rounded-full bg-white/60"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Store info and selection */}
          {selectedStore && (
            <div className="px-4 py-3 mx-3 mb-4 bg-white/5 backdrop-blur-sm rounded-lg border border-emerald-700/20">
              <div className="flex items-center">
                <Store className="h-5 w-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-emerald-100">{selectedStore.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedStore.status === 'active' ? (
                  <span className="text-emerald-400">● Active</span>
                ) : (
                  <span className="text-red-400">● Inactive</span>
                )}
              </div>
              
              {stores && stores.length > 1 && (
                <div className="mt-2">
                  <label className="text-xs text-gray-400">Switch Store:</label>
                  <select 
                    className="mt-1 block w-full pl-3 pr-10 py-1 text-xs text-white bg-emerald-800/50 border border-emerald-700/50 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border-b border-emerald-700 fixed top-0 left-0 right-0 z-40 shadow-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-200 hover:text-emerald-400 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="ml-3 flex items-center">
                <Store className="h-5 w-5 text-emerald-400 mr-2 hidden md:inline" />
                <span className="text-lg font-bold text-white hidden md:inline">Store Owner</span>
                <div className="md:hidden">
                  <span className="text-sm font-medium text-slate-200">Store Dashboard</span>
                </div>
              </div>
            </div>

            {/* Mobile-optimized right side of header */}
            <div className="flex items-center space-x-2">
              {/* Selected Store Indicator */}
              {selectedStore && (
                <div className="hidden md:flex items-center bg-emerald-700/50 px-3 py-1.5 rounded-lg border border-emerald-600/50 mr-2">
                  <Store className="h-4 w-4 text-emerald-300 mr-2" />
                  <span className="text-sm font-medium text-emerald-100">{selectedStore.name}</span>
                </div>
              )}
              
              {/* Mobile-friendly search button */}
              <button className="text-slate-300 hover:text-emerald-400 p-2 rounded-lg hover:bg-white/10 transition-all md:hidden">
                <Search className="h-5 w-5" />
              </button>
              
              {/* Mobile Selected Store */}
              {selectedStore && (
                <div className="md:hidden flex items-center bg-emerald-700/50 px-2 py-1 rounded-lg border border-emerald-600/50">
                  <Store className="h-3.5 w-3.5 text-emerald-300 mr-1" />
                  <span className="text-xs font-medium text-emerald-100 truncate max-w-[60px]">{selectedStore.name}</span>
                </div>
              )}
              
              {/* Notifications button */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="text-slate-300 hover:text-emerald-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                
                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-emerald-800 rounded-lg shadow-lg border border-emerald-700 py-1 z-50 max-h-[75vh] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-emerald-700">
                      <div className="text-sm font-medium text-white flex items-center justify-between">
                        Notifications
                        <span className="bg-emerald-600 text-emerald-100 text-xs font-medium rounded-full px-2 py-0.5">
                          {notifications.filter(n => !n.read).length} New
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-emerald-700/50">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-emerald-700/50">
                          <div className="text-sm font-medium text-white">{notification.message}</div>
                          <div className="text-xs text-emerald-300 mt-1 flex items-center justify-between">
                            <span>{notification.time}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-emerald-700/50">
                      <button 
                        className="text-xs text-emerald-300 hover:text-emerald-100 font-medium w-full text-center"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Theme toggle button */}
              <button 
                onClick={toggleTheme}
                className="text-slate-300 hover:text-emerald-400 p-2 rounded-lg hover:bg-white/10 transition-all hidden md:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* User dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center text-white hover:text-emerald-400 p-1 rounded-full hover:bg-white/10 transition-all"
                >
                  <Avatar className="h-8 w-8 border border-emerald-700/50 bg-white/10">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-emerald-800/50 text-emerald-200">
                      {adminUser?.name?.charAt(0)?.toUpperCase() || 'SO'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                
                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-emerald-800 rounded-lg shadow-lg border border-emerald-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-emerald-700">
                        <div className="text-sm font-medium text-slate-200">{adminUser?.name || 'Store Owner'}</div>
                        <div className="text-xs text-slate-400">{adminUser?.email || 'store@example.com'}</div>
                        <div className="text-xs text-emerald-400 mt-1 capitalize">{adminUser?.role || 'store_owner'}</div>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/storeowner/settings" 
                        className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-emerald-700 hover:text-emerald-400"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-emerald-700 hover:text-emerald-400 w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
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
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6 mt-16">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border-t border-emerald-700 z-30 md:hidden">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-1.5 ${
                  isActive(item.path) ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerLayout;