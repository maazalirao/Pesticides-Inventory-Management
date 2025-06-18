import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import StoreLayout from './layouts/StoreLayout';
import StoreOwnerLayout from './layouts/StoreOwnerLayout';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Products from './pages/admin/Products';
import Suppliers from './pages/admin/Suppliers';
import Customers from './pages/admin/Customers';
import Invoices from './pages/admin/Invoices';
import Reports from './pages/admin/Reports';
import Store from './pages/store/Store';
import Settings from './pages/admin/Settings';
import StoreManagement from './pages/admin/StoreManagement';
import AdminStoreDashboard from './pages/admin/AdminStoreDashboard';
import StoreOwnerDashboard from './pages/storeowner/Dashboard';
import StoreOwnerProducts from './pages/storeowner/Products';
import StoreOwnerOrders from './pages/storeowner/Orders';
import StoreOwnerInventory from './pages/storeowner/Inventory';
import StoreOwnerCustomers from './pages/storeowner/Customers';
import StoreOwnerSuppliers from './pages/storeowner/Suppliers';
import StoreProfile from './pages/storeowner/StoreProfile';
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection.jsx';
import NavigationHandler from './components/NavigationHandler';
import StoreSelector from './components/StoreSelector';
import { Toaster } from './components/ui/toaster';

// Store pages
import Homepage from './pages/store/Homepage';
import ProductListing from './pages/store/ProductListing';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import OrderHistory from './pages/store/OrderHistory';
import OrderDetail from './pages/store/OrderDetail';
import OrderConfirmation from './pages/store/OrderConfirmation';
import UserAccount from './pages/store/UserAccount';

// Admin Authentication
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import StoreOwnerLogin from './pages/admin/StoreOwnerLogin';
import UnifiedLogin from './pages/UnifiedLogin';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import StoreOwnerStoreSelector from './components/StoreOwnerStoreSelector';

function App() {
  return (
    <AdminAuthProvider>
      {/* This forces page reload when switching between admin/store */}
      <NavigationHandler />
      
      <Routes>
        {/* Landing page - main entry point */}
        <Route path="/" element={<Landing />} />
        
        {/* New unified role selection page */}
        <Route path="/role-selection" element={<RoleSelection />} />
        
        {/* Store selection for store owners - Protected route */}
        <Route path="/select-store" element={
          <AdminProtectedRoute requiredRoles={['admin', 'store_owner']}>
            <StoreSelector />
          </AdminProtectedRoute>
        } />
        
        {/* Unified Login - Primary entry point */}
        <Route path="/login" element={<UnifiedLogin />} />
        
        {/* Legacy Admin Login - Public route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Legacy Store Owner Login - Public route */}
        <Route path="/storeowner/login" element={<StoreOwnerLogin />} />
        
        {/* Store Owner Store Selection - Protected route */}
        <Route path="/storeowner/select-store" element={
          <AdminProtectedRoute requiredRoles={['store_owner']}>
            <StoreOwnerStoreSelector />
          </AdminProtectedRoute>
        } />
        
        {/* Admin routes - Protected with authentication */}
        <Route path="/admin/*" element={
          <AdminProtectedRoute requiredRoles={['admin']}>
            <MainLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="store" element={<Store />} />
          <Route path="settings" element={<Settings />} />
          <Route path="stores" element={<StoreManagement />} />
          <Route path="store-dashboard/:storeId" element={<AdminStoreDashboard />} />
        </Route>
        
        {/* Store Owner routes - Protected with authentication */}
        <Route path="/storeowner/*" element={
          <AdminProtectedRoute requiredRoles={['admin', 'store_owner']}>
            <StoreOwnerLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<StoreOwnerDashboard />} />
          <Route path="dashboard" element={<StoreOwnerDashboard />} />
          <Route path="products" element={<StoreOwnerProducts />} />
          <Route path="orders" element={<StoreOwnerOrders />} />
          <Route path="customers" element={<StoreOwnerCustomers />} />
          <Route path="inventory" element={<StoreOwnerInventory />} />
          <Route path="sales" element={<div>Store Owner Sales</div>} />
          <Route path="suppliers" element={<StoreOwnerSuppliers />} />
          <Route path="pricing" element={<div>Store Owner Pricing</div>} />
          <Route path="transactions" element={<div>Store Owner Transactions</div>} />
          <Route path="settings" element={<StoreProfile />} />
        </Route>
        
        {/* Store routes - Customer routes with Clerk auth (unchanged) */}
        <Route path="/store/*" element={<StoreLayout />}>
          <Route index element={<Homepage />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="order/:orderId" element={<OrderDetail />} />
          <Route path="account" element={<UserAccount />} />
        </Route>

        {/* Redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster />
    </AdminAuthProvider>
  );
}

export default App;
