import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import StripeWrapper from '../../components/StripeWrapper';
import { useCart } from '../../contexts/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate order totals
  const shipping = 500; // PKR 500
  const tax = Math.round(subtotal * 0.07); // 7% tax
  const total = subtotal + shipping + tax;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const handlePaymentSuccess = (paymentMethod) => {
    setIsPaymentComplete(true);
    setIsProcessing(false);
    
    // In a real app, you would save the order to your database here
    
    // Clear cart and redirect to success page
    clearCart();
    
    // Redirect to success page after a brief delay
    setTimeout(() => {
      navigate('/store/payment-success');
    }, 1500);
  };

  const handlePaymentError = (error) => {
    setPaymentError(error.message || 'An error occurred during payment processing');
    setIsProcessing(false);
  };

  if (cart.length === 0 && !isPaymentComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">You need to add some items to your cart before checking out.</p>
          <Link
            to="/store/products"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

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
        <span className="text-orange-600 font-medium">Checkout</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CreditCard className="mr-2 h-6 w-6 text-orange-500" />
              Payment Information
            </h2>

            {isPaymentComplete ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-green-700 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
                <p className="text-gray-500">Redirecting to confirmation page...</p>
                <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : (
              <>
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {paymentError}
                  </div>
                )}
                
                <div className="mb-8">
                  <p className="mb-4 text-gray-600">
                    Please enter your payment details to complete your purchase.
                  </p>
                  
                  <StripeWrapper 
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="max-h-48 overflow-y-auto mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex py-2 border-b">
                  <div className="h-14 w-14 flex-shrink-0">
                    <img 
                      src={item.image || "https://placehold.co/100x100/cccccc/333333?text=Product"} 
                      alt={item.name}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (7%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-base font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500 space-y-2">
              <p className="flex items-start">
                <ShieldCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>All transactions are secure and encrypted</span>
              </p>
              <p>Shipping costs are calculated based on your location and will be finalized at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 