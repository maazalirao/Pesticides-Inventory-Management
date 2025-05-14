import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Truck, FileText, 
  BarChart2, Settings, ShoppingBag, Menu, X, LogOut, 
  Search, User
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile or screen size is small
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [sidebarOpen]);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Package size={20} />, label: 'Products', path: '/admin/products' },
    { icon: <Package size={20} />, label: 'Inventory', path: '/admin/inventory' },
    { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/admin/orders' },
    { icon: <Users size={20} />, label: 'Customers', path: '/admin/customers' },
    { icon: <Truck size={20} />, label: 'Suppliers', path: '/admin/suppliers' },
    { icon: <FileText size={20} />, label: 'Invoices', path: '/admin/invoices' },
    { icon: <BarChart2 size={20} />, label: 'Reports', path: '/admin/reports' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar for desktop */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:block transition-all duration-300 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 shadow-xl h-screen`}
      >
        {/* Sidebar header with logo */}
        <div className="flex h-20 items-center justify-between px-5 backdrop-blur-sm bg-slate-900/70 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className={sidebarOpen ? "block" : "hidden"}>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 backdrop-blur-sm rounded-full transition-all"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar navigation */}
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
          <nav className="mt-6 px-3">
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center py-3 px-4 rounded-xl transition-all",
                      sidebarOpen ? "justify-start" : "justify-center",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg" 
                        : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-lg transition-all",
                      sidebarOpen ? "mr-3" : "",
                      isActive(item.path) 
                        ? "bg-white/20 text-white shadow-inner" 
                        : "bg-slate-800/40 text-gray-400 hover:text-white hover:bg-slate-700/50"
                    )}>
                      {item.icon}
                    </div>
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center p-3 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white transition-all",
              sidebarOpen ? "justify-start w-full" : "justify-center mx-auto"
            )}
          >
            <LogOut size={20} className={sidebarOpen ? "mr-3" : ""} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5 backdrop-blur-sm bg-slate-900/70 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 backdrop-blur-sm rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-4 px-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg" 
                      : "text-gray-200 hover:bg-white/5 hover:backdrop-blur-sm hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all",
                    isActive(item.path) 
                      ? "bg-white/20 text-white shadow-inner" 
                      : "bg-slate-800/40 text-gray-400"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-gray-200 hover:bg-white/5 hover:text-white rounded-xl transition-all"
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-lg mr-3 bg-slate-800/40 text-gray-400">
                  <LogOut size={20} />
                </div>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-30 shadow-md">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden text-slate-200 hover:text-orange-500 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="ml-3 flex items-center">
                <span className="text-lg font-bold text-white hidden md:inline">Admin Dashboard</span>
                <div className="md:hidden">
                  <span className="text-sm font-medium text-slate-200">Admin Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="text-slate-300 hover:text-orange-500 p-2 rounded-lg hover:bg-white/10 transition-all md:hidden">
                <Search className="h-5 w-5" />
              </button>
              
              <Link to="/" className="text-sm text-slate-300 hover:text-orange-500 p-2 rounded-lg hover:bg-white/10 transition-all hidden md:inline-block">
                Visit Store
              </Link>
              
              <div className="bg-white/10 p-1 rounded-full">
                <UserButton />
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 bg-white">
          <Outlet />
        </main>

        {/* Quick access mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-1.5 ${
                  isActive(item.path) ? 'text-orange-500' : 'text-slate-500'
                }`}
              >
                {item.icon}
                <span className="text-[9px] mt-0.5 truncate max-w-[40px] text-center">{item.label.substring(0, 5)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 