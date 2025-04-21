import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Truck, FileText, 
  BarChart2, Settings, ShoppingBag, Menu, X, LogOut 
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:block transition-all duration-300 bg-white border-r border-gray-200 shadow-sm`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin" className={`${sidebarOpen ? 'block' : 'hidden'} font-bold text-xl`}>
            Admin Panel
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 text-gray-700 ${
                    sidebarOpen ? 'justify-start' : 'justify-center'
                  } rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className={`flex items-center p-3 text-gray-700 ${
              sidebarOpen ? 'justify-start w-full' : 'justify-center mx-auto'
            } rounded-md hover:bg-gray-100`}
          >
            <LogOut size={20} className="mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-50`}>
        <div className="bg-white h-full w-64 shadow-lg">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="font-bold text-xl">Admin Panel</h2>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mt-6 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center p-3 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-primary">
                Visit Store
              </Link>
              <UserButton />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 