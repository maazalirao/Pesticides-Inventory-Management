import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  CalendarCheck, 
  MapPin, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    // Simulate API fetch for order details
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch order data from your API
        // For demo, we'll use mock data after a small delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Only show order details if it came from a completed transaction
        // For now, we're simulating no orders exist yet
        setOrder(null);
        
        // IMPORTANT: This mock data is commented out to ensure orders only show after transactions
        // Uncomment and modify this section when connecting to a real API
        /*
        if (orderId) {
          setOrder({
            id: orderId,
            date: '2023-05-15',
            total: 249.95,
            subtotal: 229.95,
            shipping: 10.00,
            tax: 10.00,
            status: 'Delivered',
            paymentMethod: 'Credit Card (ending in 4242)',
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main Street',
              city: 'Farmville',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            },
            items: [
              { 
                id: 1, 
                name: 'MaxKill Insecticide', 
                quantity: 3, 
                price: 49.99,
                image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MaxKill'
              },
              { 
                id: 2, 
                name: 'HerbControl Plus', 
                quantity: 2, 
                price: 38.50,
                image: 'https://placehold.co/100x100/3b82f6/FFFFFF/png?text=HerbControl'
              },
              { 
                id: 3, 
                name: 'RodentAway', 
                quantity: 1, 
                price: 22.98,
                image: 'https://placehold.co/100x100/f97316/FFFFFF/png?text=RodentAway'
              }
            ],
            timeline: [
              { date: '2023-05-15', status: 'Order Placed', description: 'Your order has been received and is being processed.' },
              { date: '2023-05-16', status: 'Payment Confirmed', description: 'Payment has been confirmed and validated.' },
              { date: '2023-05-17', status: 'Order Processed', description: 'Your order has been processed and is ready for shipping.' },
              { date: '2023-05-18', status: 'Shipped', description: 'Your order has been shipped via FedEx (Tracking: FX8294728937).' },
              { date: '2023-05-20', status: 'Delivered', description: 'Your order has been delivered successfully.' }
            ]
          });
        } else {
          setOrder(null);
        }
        */
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // If no order is found, show empty state
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/store/orders" className="hover:text-primary">Orders</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-800">Order Details</span>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">No Order Found</h1>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you may not have permission to view it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/store/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              View Order History
            </Link>
            <Link 
              to="/store"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
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
          
          <div className="grid md:grid-cols-4 gap-6 border-t pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 flex items-center">
                <Package size={16} className="mr-1" />
                Order ID
              </span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 flex items-center">
                <CalendarCheck size={16} className="mr-1" />
                Order Date
              </span>
              <span className="font-medium">{formatDate(order.date)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 flex items-center">
                <CreditCard size={16} className="mr-1" />
                Payment Method
              </span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 flex items-center">
                <Truck size={16} className="mr-1" />
                Shipping Method
              </span>
              <span className="font-medium">Standard Shipping</span>
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
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="p-6 flex flex-wrap items-center gap-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`} className="font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right font-medium">
                  <p>{formatCurrency(item.price)}</p>
                  <p className="text-primary">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary and Shipping Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              Shipping Address
            </h2>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-gray-500" />
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions or issues regarding this order, please contact our customer support.
          </p>
          <div className="flex space-x-4">
            <Link 
              to="/contact" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Contact Support
            </Link>
            <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
              Request Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 