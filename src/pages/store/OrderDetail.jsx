import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  CalendarCheck, 
  MapPin, 
  ShoppingBag,
  AlertCircle,
  Clock
} from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  
  // Function to get user-specific orders key
  const getOrdersKey = () => {
    if (isSignedIn && user) {
      return `orders_${user.id}`;
    }
    return 'orders_guest';
  };
  
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get user-specific orders key
        const ordersKey = getOrdersKey();
        
        // Get orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        const foundOrder = savedOrders.find(order => order.id === orderId);
        
        if (foundOrder) {
          // Add timeline to the order
          foundOrder.timeline = [
            { 
              date: foundOrder.date, 
              status: 'Order Placed', 
              description: 'Your order has been received and is being processed.' 
            }
          ];
          
          // Add more timeline events based on status
          if (foundOrder.status === 'Processing' || foundOrder.status === 'Shipped' || foundOrder.status === 'Delivered') {
            foundOrder.timeline.push({ 
              date: new Date(new Date(foundOrder.date).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), 
              status: 'Payment Confirmed', 
              description: 'Payment has been confirmed and validated.' 
            });
            
            foundOrder.timeline.push({ 
              date: new Date(new Date(foundOrder.date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
              status: 'Order Processed', 
              description: 'Your order has been processed and is ready for shipping.' 
            });
          }
          
          if (foundOrder.status === 'Shipped' || foundOrder.status === 'Delivered') {
            foundOrder.timeline.push({ 
              date: new Date(new Date(foundOrder.date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
              status: 'Shipped', 
              description: 'Your order has been shipped via Express Delivery (Tracking: PK123456789).' 
            });
          }
          
          if (foundOrder.status === 'Delivered') {
            foundOrder.timeline.push({ 
              date: new Date(new Date(foundOrder.date).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
              status: 'Delivered', 
              description: 'Your order has been delivered successfully.' 
            });
          }
          
          setOrder(foundOrder);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
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
  
  // If loading, show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  // If no order is found, show error
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="bg-red-100 p-4 rounded-full inline-flex mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the order you're looking for. It might have been removed or the ID is incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/store/orders"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-md"
          >
            Back to Order History
          </Link>
          <Link 
            to="/store/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  // When an order exists, show the regular order detail page
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/store/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/store/orders" className="hover:text-primary">Orders</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">{order.id}</span>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <Link to="/store/orders" className="text-primary flex items-center hover:underline mb-2">
                <ArrowLeft size={16} className="mr-1" />
                Back to Orders
              </Link>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-gray-600">
                Order #{order.id} • Placed on {formatDate(order.date)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-primary mr-2" />
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Order Date</p>
              <div className="flex items-center">
                <CalendarCheck className="h-4 w-4 text-primary mr-2" />
                <p className="font-medium">{formatDate(order.date)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Items</p>
              <div className="flex items-center">
                <Package className="h-4 w-4 text-primary mr-2" />
                <p className="font-medium">{order.items} {order.items === 1 ? 'Item' : 'Items'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Ordered Items</h2>
          <div className="border rounded-lg divide-y">
            {order.products.map((item, index) => (
              <div key={index} className="flex items-center p-4 gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.total / 1.07)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax (7%)</span>
              <span className="font-medium">{formatCurrency(order.total - (order.total / 1.07))}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between py-2 border-t mt-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
        
        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
          <div className="relative">
            {order.timeline.map((event, index) => (
              <div key={index} className="mb-6 flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary text-white">
                    {index + 1}
                  </div>
                  {index < order.timeline.length - 1 && (
                    <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{event.status}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-semibold mb-2">Need Help With This Order?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions or concerns about this order, please contact our customer support team.
              </p>
            </div>
            <Link 
              to="/contact"
              className="px-6 py-2 bg-primary text-white rounded-md shadow-sm whitespace-nowrap"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 