import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  
  // Get order ID from location state or generate a fallback
  const orderNumber = location.state?.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/store/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/store/checkout" className="hover:text-primary">Checkout</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">Order Confirmation</span>
      </div>
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully and is now being processed.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-gray-500 mb-2">Order Number</p>
          <p className="text-2xl font-bold text-gray-800">{orderNumber}</p>
        </div>
        
        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to your email address with the order details.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/store/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <ShoppingBag size={18} />
            View Order History
          </Link>
          <Link 
            to="/store"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 