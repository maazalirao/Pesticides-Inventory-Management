import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Search,
  Filter,
  ChevronDown,
  ShoppingCart,
  Eye,
  Tag,
  AlertTriangle,
  Star,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { getProducts } from "../../lib/api";

const Store = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("products");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products on component mount with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Pass the Clerk user ID to fetch only products for this user
        const data = await getProducts(user?.id);

        if (isMounted) {
          console.log("Products fetched:", data);
          setProducts(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Products fetch error in component:", err);
          setError("Failed to fetch products. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch products if the user is loaded
    if (user) {
      fetchProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Mock data for orders
  const orders = [];

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    return (
      (searchTerm === "" ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (filterCategory === "All" || product.category === filterCategory)
    );
  });

  // Get all unique categories
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount);
  };

  // Get stock status badge
  const getStockStatus = (stock) => {
    if (stock <= 0)
      return { label: "Out of Stock", className: "bg-red-100 text-red-800" };
    if (stock < 10)
      return { label: "Low Stock", className: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", className: "bg-green-100 text-green-800" };
  };

  // Add to cart function
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Get order status badge color
  const getOrderStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">
            Online Store
          </h1>
          <p className="hidden md:block text-muted-foreground">
            Manage your online store products and orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>
              Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
            </span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "products"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "orders"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "settings"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Store Settings
        </button>
      </div>

      {activeTab === "products" && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="relative inline-block w-48">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stockQuantity || 0
                  );

                  return (
                    <Card key={product._id} className="overflow-hidden">
                      <div className="relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground opacity-40" />
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                            Featured
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {product.category || "Uncategorized"}
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2 h-10">
                          {product.description || "No description available"}
                        </p>

                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.rating || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews || 0} reviews)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {formatCurrency(product.price || 0)}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1"
                          onClick={() => addToCart(product)}
                          disabled={
                            !product.stockQuantity || product.stockQuantity <= 0
                          }
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-10">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No products found
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "orders" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Manage customer orders from your online store
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No Orders Yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Orders will appear here after customers complete transactions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-3 px-4 text-left font-medium">
                        Order ID
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Customer
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Items</th>
                      <th className="py-3 px-4 text-left font-medium">Total</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Status
                      </th>
                      <th className="py-3 px-4 text-center font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/25">
                        <td className="py-3 px-4 font-medium">{order.id}</td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Configure your online store settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <input
                  type="text"
                  defaultValue="Pesticide Inventory Store"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Store Description</label>
                <textarea
                  rows={3}
                  defaultValue="Professional pesticide products for all your pest control needs."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <input
                  type="email"
                  defaultValue="store@pesttrack.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your payment and shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Accepted Payment Methods
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="credit-card"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="credit-card"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Credit Card
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paypal"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="paypal"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      PayPal
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bank-transfer"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="bank-transfer"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Bank Transfer
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Shipping Options</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="standard"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="standard"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Standard Shipping (PKR 599)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="express"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="express"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Express Shipping (PKR 1,299)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="free"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="free"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Free Shipping (Orders over PKR 10,000)
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Important Note
                    </h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      A valid payment processor connection is required for the
                      store to process payments. Please complete the setup in
                      the backend administration panel.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Store;
