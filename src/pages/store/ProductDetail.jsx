import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, ArrowLeft, Minus, Plus, 
  ChevronRight, ShieldCheck, Truck, RefreshCcw, AlertTriangle 
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        
        // Fetch related products (products in the same category)
        const relatedResponse = await axios.get('/api/products', {
          params: { category: response.data.category, limit: 4 }
        });
        
        // Filter out the current product from related products
        const filteredRelated = relatedResponse.data.filter(
          item => item._id !== response.data._id
        ).slice(0, 3); // Get up to 3 related products
        
        setRelatedProducts(filteredRelated);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  const [activeImage, setActiveImage] = useState(0);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  const handleQuantityChange = (newQuantity) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, product?.stockQuantity || 100));
    setQuantity(clampedQuantity);
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity
      });
      // Show notification (in a real app, you might use a toast notification)
      alert(`${quantity} x ${product.name} added to cart!`);
    }
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
          <h2 className="text-2xl font-bold mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/store/products"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/store/products"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Create product images array
  const productImages = product.image 
    ? [product.image] 
    : ["https://placehold.co/800x600/cccccc/FFFFFF/png?text=No+Image"];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/store" className="hover:text-primary">Store</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to={`/store/products?category=${product.category.toLowerCase()}`} className="hover:text-primary">
          {product.category}
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">{product.name}</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Images */}
        <div className="md:w-1/2">
          <div className="mb-4 rounded-lg overflow-hidden border">
            <img 
              src={productImages[activeImage]} 
              alt={product.name}
              className="w-full h-auto object-contain aspect-square" 
            />
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2">
              {productImages.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`border rounded-md overflow-hidden ${
                    activeImage === idx ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-20 h-20 object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {product.category}
            </span>
            {product.manufacturer && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium ml-2">
                {product.manufacturer}
              </span>
            )}
          </div>
          
          <div className="text-2xl font-bold text-primary mb-4">
            {formatCurrency(product.price)}
          </div>
          
          <p className="text-gray-700 mb-6">
            {product.description}
          </p>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={product.stockQuantity > 0 ? 'text-green-700' : 'text-red-700'}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className={`p-2 ${quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:text-primary'}`}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-12 text-center border-0 focus:ring-0"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className={`p-2 ${quantity >= product.stockQuantity ? 'text-gray-300' : 'text-gray-600 hover:text-primary'}`}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className={`px-6 py-3 rounded-md flex-1 flex items-center justify-center gap-2 ${
                product.stockQuantity > 0
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            
            <Link to="/store/cart">
              <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                View Cart
              </button>
            </Link>
          </div>
          
          <div className="space-y-4 border-t pt-6">
            {product.sku && (
              <div className="flex items-start">
                <div className="font-medium w-32">SKU:</div>
                <div>{product.sku}</div>
              </div>
            )}
            
            {product.toxicityLevel && (
              <div className="flex items-start">
                <div className="font-medium w-32">Toxicity Level:</div>
                <div>{product.toxicityLevel}</div>
              </div>
            )}
            
            {product.recommendedUse && (
              <div className="flex items-start">
                <div className="font-medium w-32">Recommended Use:</div>
                <div>{product.recommendedUse}</div>
              </div>
            )}
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-start">
                <div className="font-medium w-32">Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center p-4 border rounded-md">
              <ShieldCheck className="h-5 w-5 text-green-500 mr-3" />
              <div className="text-sm">
                <p className="font-medium">Guaranteed</p>
                <p className="text-gray-500">Quality Product</p>
              </div>
            </div>
            <div className="flex items-center p-4 border rounded-md">
              <Truck className="h-5 w-5 text-blue-500 mr-3" />
              <div className="text-sm">
                <p className="font-medium">Fast Delivery</p>
                <p className="text-gray-500">Nationwide</p>
              </div>
            </div>
            <div className="flex items-center p-4 border rounded-md">
              <RefreshCcw className="h-5 w-5 text-orange-500 mr-3" />
              <div className="text-sm">
                <p className="font-medium">Easy Returns</p>
                <p className="text-gray-500">30 Day Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link to={`/store/product/${relProduct._id}`} key={relProduct._id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={relProduct.image || "https://placehold.co/300x300/cccccc/FFFFFF/png?text=No+Image"} 
                      alt={relProduct.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{relProduct.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{relProduct.category}</p>
                    <p className="font-bold text-primary">{formatCurrency(relProduct.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 