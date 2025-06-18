import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { 
  ChevronRight, 
  ShoppingBag, 
  Eye, 
  Calendar, 
  Package, 
  Truck, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  Search,
  ArrowRight,
  Filter,
  AlertCircle
} from 'lucide-react';

const OrderHistory = () => {
  // State for order data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isSignedIn, user } = useUser();
  
  // Function to get user-specific orders key
  const getOrdersKey = () => {
    if (isSignedIn && user) {
      return `orders_${user.id}`;
    }
    return 'orders_guest';
  };
  
  // Fetch orders function
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get user-specific orders key
        const ordersKey = getOrdersKey();
        
        // Get orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        
        // Sort orders by date (newest first)
        const sortedOrders = savedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [isSignedIn, user]);

  // Listen for order updates
  useEffect(() => {
    const handleOrdersUpdate = () => {
      console.log('Orders updated, refreshing order history');
      fetchOrders();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, []);
  
  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === '' || 
      order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  // Get order status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/account" className="hover:text-green-600 transition-colors">My Account</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-800">Order History</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
          <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            <Link to="/store/products" className="text-white hover:text-green-200 text-sm transition-colors font-medium flex items-center">
              Continue Shopping
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="p-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="flex gap-3">
                <select 
                  className="py-2 px-4 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Filter by status</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  <Filter className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                <p>{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">No orders found</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {orders.length === 0 
                    ? "You haven't placed any orders yet. Start shopping and your orders will appear here."
                    : "No orders match your search criteria. Try adjusting your filters."}
                </p>
                <Link 
                  to="/store/products" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Start Shopping
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-800">{order.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-gray-700">{formatDate(order.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-gray-700">{order.items} items</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/store/orders/${order.id}`}
                            className="text-green-600 hover:text-green-700 transition-colors flex items-center justify-end"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-green-100 p-4 rounded-full md:p-6">
              <AlertCircle className="w-8 h-8 text-green-600 md:w-10 md:h-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Need Help With Your Order?</h2>
              <p className="text-gray-600 mb-4 md:mb-0">
                If you have any questions or concerns about your orders, please don't hesitate to contact our customer support team.
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                to="/contact" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-center"
              >
                Contact Support
              </Link>
              <Link 
                to="/faq" 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory; 