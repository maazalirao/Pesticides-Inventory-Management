import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  // Generate a random order reference
  const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-8 text-slate-500">
        <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/store" className="hover:text-orange-500 transition-colors">Store</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/store/cart" className="hover:text-orange-500 transition-colors">Cart</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/store/checkout" className="hover:text-orange-500 transition-colors">Checkout</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-orange-600 font-medium">Payment Success</span>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Reference</p>
              <p className="font-medium">{orderRef}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">Credit Card</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-green-600">Paid</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/store" 
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-200"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            to="/store/orders" 
            className="px-6 py-3 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 