import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Eye, Calendar, Package } from 'lucide-react';

const OrderHistory = () => {
  // Mock order history data
  const orders = [];
  
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
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">Order History</span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Link to="/shop" className="text-primary text-sm hover:underline">
            Continue Shopping
          </Link>
        </div>
        
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium">No orders yet</h2>
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link 
                to="/shop" 
                className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{formatDate(order.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{order.items} items</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/orders/${order.id}`}
                          className="text-primary hover:text-primary/80 flex items-center justify-end"
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
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Need Help With Your Order?</h2>
        <p className="text-gray-600 mb-4">
          If you have any questions or concerns about your orders, please don't hesitate to contact our customer support team.
        </p>
        <div className="flex space-x-4">
          <Link 
            to="/contact" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Contact Support
          </Link>
          <Link 
            to="/faq" 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory; 