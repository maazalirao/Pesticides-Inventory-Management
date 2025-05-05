import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/clerk-react";
import MainLayout from "./layouts/MainLayout";
import StoreLayout from "./layouts/StoreLayout";
import Dashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import Products from "./pages/admin/Products";
import Suppliers from "./pages/admin/Suppliers";
import Customers from "./pages/admin/Customers";
import Invoices from "./pages/admin/Invoices";
import Reports from "./pages/admin/Reports";
import Store from "./pages/store/Store";
import Settings from "./pages/admin/Settings";
import Landing from "./pages/Landing";

// Store pages
import Homepage from "./pages/store/Homepage";
import ProductListing from "./pages/store/ProductListing";
import ProductDetail from "./pages/store/ProductDetail";
import Cart from "./pages/store/Cart";
import Checkout from "./pages/store/Checkout";
import OrderHistory from "./pages/store/OrderHistory";
import OrderDetail from "./pages/store/OrderDetail";
import OrderConfirmation from "./pages/store/OrderConfirmation";
import UserAccount from "./pages/store/UserAccount";

function App() {
  return (
    <Router>
      <ClerkLoading>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <Routes>
          {/* Landing page - main entry point */}
          <Route path="/" element={<Landing />} />

          {/* Auth routes */}
          <Route
            path="/sign-in/*"
            element={
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            }
          />

          {/* Admin routes - protected routes that require authentication */}
          <Route path="/admin" element={<RequireAuth redirectTo="/" />}>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="products" element={<Products />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="store" element={<Store />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Store routes - public routes accessible to all users */}
          <Route element={<StoreLayout />}>
            <Route path="/store">
              <Route index element={<Homepage />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route
                path="order-confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="order/:orderId" element={<OrderDetail />} />
              <Route path="account" element={<UserAccount />} />
            </Route>
          </Route>

          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ClerkLoaded>
    </Router>
  );
}

// Simple wrapper component to protect routes
function RequireAuth({ redirectTo = "/" }) {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={window.location.href} />
      </SignedOut>
    </>
  );
}

export default App;
