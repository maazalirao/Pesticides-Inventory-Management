import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Store from './pages/Store';
import Settings from './pages/Settings';
import TestComponent from './components/TestComponent';

function App() {
  return (
    <Router>
      <Routes>
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

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
