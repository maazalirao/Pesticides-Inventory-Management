import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Get user-specific cart key
  const getCartKey = () => {
    if (isSignedIn && user) {
      return `cart_${user.id}`;
    }
    return 'cart_guest';
  };

  // Initialize cart from localStorage if available, using user-specific key
  const [cart, setCart] = useState(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [cartOpen, setCartOpen] = useState(false);
  
  // Update cart when user changes
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  }, [isSignedIn, user]);
  
  // Save cart to localStorage when it changes, using user-specific key
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, isSignedIn, user]);
  
  // Add an item to the cart - with authentication check
  const addToCart = (product, quantity = 1) => {
    // Check if user is signed in before adding to cart
    if (!isSignedIn) {
      setShowAuthModal(true);
      return false; // Return false to indicate item was not added
    }
    
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    return true; // Return true to indicate item was added successfully
  };
  
  // Update quantity of an item in the cart
  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: quantity };
        }
        return item;
      });
    });
  };
  
  // Remove an item from the cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Toggle cart visibility
  const toggleCart = () => {
    setCartOpen(prev => !prev);
  };
  
  // Close auth modal
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };
  
  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    cartOpen,
    setCartOpen,
    toggleCart,
    showAuthModal,
    closeAuthModal,
    isSignedIn
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
      
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please sign in to add items to your cart and make purchases.
              </p>
              
              <div className="space-y-3">
                <SignInButton mode="modal" redirectUrl={window.location.pathname}>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                
                <button
                  onClick={closeAuthModal}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export default CartContext; 