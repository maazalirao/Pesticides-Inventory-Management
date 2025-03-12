import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">PestTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-muted-foreground md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 md:ml-0">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden text-sm font-medium md:block">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 