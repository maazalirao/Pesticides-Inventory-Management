import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  MapPin, 
  Mail, 
  Phone,
  Edit,
  Eye,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Calendar,
  CreditCard,
  Truck,
  UserCircle
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const UserAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isLoaded } = useUser();
  
  // Order history - initially empty
  const orders = [];
  
  // Mock wishlist
  const wishlist = [
    { id: 1, name: 'MaxKill Insecticide', price: 49.99, image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MaxKill' },
    { id: 2, name: 'HerbControl Plus', price: 38.50, image: 'https://placehold.co/100x100/3b82f6/FFFFFF/png?text=HerbControl' },
    { id: 3, name: 'FungoClear Solution', price: 65.00, image: 'https://placehold.co/100x100/8b5cf6/FFFFFF/png?text=FungoClear' }
  ];
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  // If user data is not loaded yet, show loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-800">My Account</span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
                <div className="bg-green-600/10 rounded-full p-3">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="h-14 w-14 rounded-full" />
                  ) : (
                    <UserCircle className="h-14 w-14 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-800">{user.fullName || user.username}</h2>
                  <p className="text-gray-500 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-green-600 text-white font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className={`h-5 w-5 mr-3 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`} />
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-green-600 text-white font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className={`h-5 w-5 mr-3 ${activeTab === 'orders' ? 'text-white' : 'text-gray-500'}`} />
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-colors ${
                    activeTab === 'wishlist' 
                      ? 'bg-green-600 text-white font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-3 ${activeTab === 'wishlist' ? 'text-white' : 'text-gray-500'}`} />
                  Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-green-600 text-white font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className={`h-5 w-5 mr-3 ${activeTab === 'settings' ? 'text-white' : 'text-gray-500'}`} />
                  Settings
                </button>
                <Link
                  to="/logout"
                  className="w-full text-left py-3 px-4 rounded-lg flex items-center text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Contact our customer support team if you have any questions.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center text-green-600 text-sm hover:text-green-700 transition-colors font-medium"
              >
                Contact Support
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                  <button className="text-white hover:text-green-200 transition-colors flex items-center text-sm font-medium">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                        <UserCircle className="h-5 w-5 text-green-600 mr-2" />
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">{user.fullName || user.username}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                          <Mail className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="font-medium text-gray-800">{user.primaryEmailAddress?.emailAddress}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
                          <Phone className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-800">{user.phoneNumbers?.[0]?.phoneNumber || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium text-gray-800">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        Default Shipping Address
                      </h3>
                      <div className="bg-white p-6 rounded-lg shadow-sm min-h-[200px] flex flex-col">
                        {user.publicMetadata?.address ? (
                          <>
                            <p className="font-medium text-gray-800">{user.fullName || user.username}</p>
                            <p className="text-gray-600">{user.publicMetadata.address.street}</p>
                            <p className="text-gray-600">{user.publicMetadata.address.city}, {user.publicMetadata.address.state} {user.publicMetadata.address.zipCode}</p>
                            <p className="text-gray-600 mb-4">{user.publicMetadata.address.country}</p>
                          </>
                        ) : (
                          <p className="text-gray-500 mb-4">No address information provided</p>
                        )}
                        <button className="mt-auto text-green-600 text-sm hover:text-green-700 transition-colors font-medium flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          {user.publicMetadata?.address ? 'Edit Address' : 'Add Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-green-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Order History</h2>
                </div>
                
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You haven't placed any orders yet. Start shopping and your orders will appear here.
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
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <span className="text-sm text-gray-500">Order #:</span>
                                <span className="font-semibold ml-2 text-gray-800">{order.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <span className="text-sm text-gray-500">Date:</span>
                                <span className="font-medium ml-2 text-gray-800">{formatDate(order.date)}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <span className="text-sm text-gray-500">Total:</span>
                                <span className="font-medium ml-2 text-gray-800">{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Truck className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="font-semibold mb-4 text-gray-800">Order Items</h3>
                            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between py-3 px-4 bg-white rounded-lg shadow-sm">
                                  <div>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <Link 
                              to={`/orders/${order.id}`}
                              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-green-600 hover:text-green-700 transition-colors shadow-sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-green-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Wishlist</h2>
                </div>
                
                <div className="p-6">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-10 w-10 text-red-500" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Items added to your wishlist will appear here. Find products you love and save them for later.
                      </p>
                      <Link 
                        to="/store/products" 
                        className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Browse Products
                        <ChevronRight size={18} className="ml-1" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {wishlist.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <div className="flex">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="ml-4 flex-1">
                                <Link to={`/product/${item.id}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors">
                                  {item.name}
                                </Link>
                                <p className="text-green-600 font-semibold mt-1">{formatCurrency(item.price)}</p>
                                <div className="mt-4 flex gap-2">
                                  <button className="flex-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors">
                                    Add to Cart
                                  </button>
                                  <button className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors">
                                    <Heart className="h-4 w-4" fill="currentColor" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="bg-green-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Account Settings</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                        <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
                        Security
                      </h3>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-gray-700 mb-4">Manage your password and account security settings</p>
                        <button className="text-green-600 hover:text-green-700 transition-colors flex items-center text-sm font-medium">
                          <Edit className="h-4 w-4 mr-1" />
                          Change Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                        <Mail className="h-5 w-5 text-green-600 mr-2" />
                        Communication Preferences
                      </h3>
                      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600 rounded mr-3" defaultChecked />
                          <span className="text-gray-700">Email notifications for orders</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600 rounded mr-3" defaultChecked />
                          <span className="text-gray-700">Email notifications for promotions</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="form-checkbox h-5 w-5 text-green-600 rounded mr-3" />
                          <span className="text-gray-700">SMS notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-semibold mb-6 flex items-center text-gray-800">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      Account Management
                    </h3>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <p className="text-gray-700 mb-4">
                        Permanently delete your account and all of your data from our systems. This action cannot be undone.
                      </p>
                      <button className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount; 