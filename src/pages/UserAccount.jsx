import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const UserAccount = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      fetchUserData();
      fetchUserOrders();
      fetchUserWishlist();
    }
  }, [isSignedIn, clerkUser]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/users/profile");
      console.log("response.data", response.data);
      setUserData(response.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await axios.get("/api/orders/myorders");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const response = await axios.get("/api/users/profile/wishlist");
      setWishlist(response.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettings = async (settings) => {
    try {
      await axios.put("/api/users/profile", settings);
      fetchUserData();
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Failed to update settings");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/users/profile/wishlist/${productId}`);
      fetchUserWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item from wishlist");
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post("/api/cart", { productId, quantity: 1 });
      // Show success message or update cart count
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">
          Please sign in to view your account
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchUserData();
            fetchUserOrders();
            fetchUserWishlist();
          }}
          className="mt-4 text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">My Account</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/10 rounded-full p-3">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  {userData?.name || clerkUser.firstName}
                </h2>
                <p className="text-gray-600 text-sm">
                  {userData?.email || clerkUser.emailAddresses[0].emailAddress}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === "profile"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === "orders"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <ShoppingBag className="h-4 w-4 mr-3" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === "wishlist"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Heart className="h-4 w-4 mr-3" />
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === "settings"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === "profile" && userData && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Profile Information is here
                </h2>
                <button
                  onClick={() => updateUserSettings(userData)}
                  className="text-primary hover:text-primary/80 flex items-center text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </button>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userData.name}</p>
                      </div>
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">{userData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{userData.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">
                      Default Shipping Address
                    </h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{userData.name}</p>
                        <p>{userData.address?.street}</p>
                        <p>
                          {userData.address?.city}, {userData.address?.state}{" "}
                          {userData.address?.zipCode}
                        </p>
                        <p>{userData.address?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Order History</h2>
              </div>
              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <Link
                      to="/store/products"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="text-sm text-gray-500">
                              Order #:
                            </span>
                            <span className="font-semibold ml-2">
                              {order._id}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="font-medium ml-2">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Total:
                            </span>
                            <span className="font-medium ml-2">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-3">Order Items</h3>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between py-2 border-b last:border-0"
                              >
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">My Wishlist</h2>
              </div>
              <div className="p-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Save items you're interested in for later.
                    </p>
                    <Link
                      to="/store/products"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="p-4 flex">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="ml-4">
                            <Link
                              to={`/store/products/${item._id}`}
                              className="font-medium hover:text-primary"
                            >
                              {item.name}
                            </Link>
                            <p className="text-primary font-semibold mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => addToCart(item._id)}
                                className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item._id)}
                                className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                              >
                                Remove
                              </button>
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
          {activeTab === "settings" && userData && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Account Settings</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Communication Preferences
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={userData.settings?.emailNotifications}
                          onChange={(e) =>
                            updateUserSettings({
                              ...userData.settings,
                              emailNotifications: e.target.checked,
                            })
                          }
                        />
                        <span>Email notifications for orders</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={userData.settings?.promotionalEmails}
                          onChange={(e) =>
                            updateUserSettings({
                              ...userData.settings,
                              promotionalEmails: e.target.checked,
                            })
                          }
                        />
                        <span>Email notifications for promotions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
