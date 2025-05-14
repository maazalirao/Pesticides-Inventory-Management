import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useUser } from '@clerk/clerk-react';
import { ChevronRight, CreditCard, Truck, Check, ShieldCheck, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { isSignedIn, user } = useUser();
  
  // Function to get user-specific orders key
  const getOrdersKey = () => {
    if (isSignedIn && user) {
      return `orders_${user.id}`;
    }
    return 'orders_guest';
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // If cart is empty, redirect to cart page
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-6">You need to add items to your cart before checking out.</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600"
        >
          <ArrowLeft size={16} />
          Go to Shop
        </Link>
      </div>
    );
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNextStep = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create order object with all necessary details
      const orderItems = cart.map(item => ({
        product: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || `https://placehold.co/100x100/e2e8f0/64748b?text=${item.name.charAt(0)}`,
        storeId: item.storeId || 'default-store' // Store ID for associating with store owner
      }));
      
      const orderData = {
        orderItems,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: 'Pakistan', // Default for demo
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        taxPrice: subtotal * 0.07,
        shippingPrice: 0, // Free shipping for demo
        totalPrice: subtotal + (subtotal * 0.07),
      };

      // In a real app, call your API here
      // const response = await axios.post('/api/orders', orderData);
      
      // For demo, simulate API call with localStorage
      // Create a unique order ID
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Get user-specific orders key
      const ordersKey = getOrdersKey();
      
      // Prepare customer information
      const customerInfo = isSignedIn && user ? {
        id: user.id,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      } : {
        id: 'guest',
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      };
      
      // Get existing orders from localStorage or initialize empty array
      const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      
      // Add new order with status and date
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: orderItems.reduce((total, item) => total + item.quantity, 0),
        total: orderData.totalPrice,
        status: 'processing',
        products: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        customer: customerInfo
      };
      
      // Save updated orders to localStorage with user-specific key
      localStorage.setItem(ordersKey, JSON.stringify([...existingOrders, newOrder]));

      // Now also save this order to store-specific orders
      // Group order items by store
      const storeOrders = {};
      orderItems.forEach(item => {
        const storeId = item.storeId || 'default-store';
        if (!storeOrders[storeId]) {
          storeOrders[storeId] = {
            items: [],
            quantity: 0,
            total: 0
          };
        }
        storeOrders[storeId].items.push(item);
        storeOrders[storeId].quantity += item.quantity;
        storeOrders[storeId].total += item.price * item.quantity;
      });

      // Save order to each store's orders
      Object.keys(storeOrders).forEach(storeId => {
        const storeOrdersKey = `store_orders_${storeId}`;
        const existingStoreOrders = JSON.parse(localStorage.getItem(storeOrdersKey) || '[]');
        
        const storeOrder = {
          id: orderId,
          date: new Date().toISOString(),
          items: storeOrders[storeId].items,
          itemsCount: storeOrders[storeId].quantity,
          total: storeOrders[storeId].total,
          status: 'processing',
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          customer: customerInfo,
          storeId: storeId
        };
        
        localStorage.setItem(storeOrdersKey, JSON.stringify([...existingStoreOrders, storeOrder]));
      });
      
      // Notify any listening components that orders have been updated
      window.dispatchEvent(new Event('ordersUpdated'));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart and navigate to success page
      clearCart();
      navigate('/store/order-confirmation', { state: { orderId } });
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/cart" className="hover:text-green-600">Cart</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">Checkout</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            {/* Checkout Steps */}
            <div className="flex mb-8">
              <div className="flex-1">
                <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 1 ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    1
                  </div>
                  <span className="font-medium">Shipping</span>
                </div>
                <div className={`ml-4 border-l-2 h-8 ${step >= 2 ? 'border-green-600' : 'border-gray-200'}`}></div>
              </div>
              <div className="flex-1">
                <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 2 ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    2
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-green-600" />
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    >
                      <option value="">Select a country</option>
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AUS">Australia</option>
                      <option value="PAK">Pakistan</option>
                      <option value="IND">India</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-600"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-green-600" />
                    Payment Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit-card"
                            checked={formData.paymentMethod === 'credit-card'}
                            onChange={handleInputChange}
                            className="mr-2 accent-green-600"
                          />
                          <span>Credit Card</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleInputChange}
                            className="mr-2 accent-green-600"
                          />
                          <span>PayPal</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank-transfer"
                            checked={formData.paymentMethod === 'bank-transfer'}
                            onChange={handleInputChange}
                            className="mr-2 accent-green-600"
                          />
                          <span>Bank Transfer</span>
                        </label>
                      </div>
                    </div>
                    
                    {formData.paymentMethod === 'credit-card' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                              CVV <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="text-gray-600 hover:text-gray-800 underline"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      className={`bg-green-700 text-white px-6 py-2 rounded-md ${
                        loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-600'
                      }`}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              <div className="space-y-3 pb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={item.image || `https://placehold.co/100x100/e2e8f0/64748b?text=${item.name.charAt(0)}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
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
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(subtotal * 0.07)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-base font-bold text-green-700">
                      {formatCurrency(subtotal + (subtotal * 0.07))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-green-600" />
                <span>Free shipping on orders over PKR 10,000</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 