import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Trash2, Plus, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart data
  useEffect(() => {
    try {
      setLoading(false);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart data. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Function to handle quantity updates
  const handleQuantityUpdate = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  // Function to handle item removal
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Calculate order summary values
  const shipping = cart.length > 0 ? 15.00 : 0;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  // Handle checkout
  const handleCheckout = () => {
    navigate('/store/checkout');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
        <span className="text-orange-600 font-medium">Shopping Cart</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <motion.div 
          className="flex-1"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-slate-800 bg-clip-text text-transparent">
              Your Shopping Cart
            </h1>
            <span className="text-slate-500">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          {cart.length === 0 ? (
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <ShoppingCart size={48} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-medium mb-2 text-slate-700">Your cart is empty</h2>
              <p className="text-slate-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Link 
                to="/store/products"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <motion.tr key={item.id} variants={itemVariants}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden border border-slate-100">
                              <img src={item.image || "https://placehold.co/300x300/cccccc/FFFFFF/png?text=No+Image"} 
                                alt={item.name} className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-700">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-500 hover:text-orange-500 h-7 w-7 rounded-full flex items-center justify-center bg-slate-100 hover:bg-orange-100 transition-colors"
                              onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </motion.button>
                            <input
                              type="number"
                              className="w-12 h-8 text-center border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={item.quantity}
                              min="1"
                              onChange={(e) => handleQuantityUpdate(item.id, parseInt(e.target.value) || 1)}
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-500 hover:text-orange-500 h-7 w-7 rounded-full flex items-center justify-center bg-slate-100 hover:bg-orange-100 transition-colors"
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-700">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => clearCart()}
                  className="text-sm text-slate-600 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
                <Link 
                  to="/store/products"
                  className="text-sm text-slate-600 hover:text-orange-500 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {cart.length > 0 && (
          <motion.div 
            className="w-full md:w-96"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (7%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-slate-800">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              
              <button 
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-6 text-xs text-slate-500 space-y-2">
                <p className="flex items-start">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>All transactions are secure and encrypted</span>
                </p>
                <p>Shipping costs are calculated based on your location and will be finalized at checkout.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cart; 