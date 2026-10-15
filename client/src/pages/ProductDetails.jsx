import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [actionError, setActionError] = useState('');
  const { addToCart } = useCart();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    setActionError('');
    try {
      const [userRes, productRes, wishlistRes] = await Promise.all([
        api.get('/customers/me'),
        api.get(`/products/${id}`),
        api.get('/wishlist').catch(() => ({ data: { wishlist: [] } })),
      ]);

      setCustomer(userRes.data);

      if (productRes.data && productRes.data.product) {
        setProduct(productRes.data.product);
      } else {
        setError(true);
      }

      if (wishlistRes.data && Array.isArray(wishlistRes.data.wishlist)) {
        const exists = wishlistRes.data.wishlist.some((item) => item._id === id);
        setIsInWishlist(exists);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (isSaving || !product) return;

    setIsSaving(true);
    setActionError('');

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product._id}`);
        setIsInWishlist(false);
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsInWishlist(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setIsInWishlist(true);
      } else {
        setActionError('Unable to update wishlist. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingCart || !product || product.stock <= 0) return;
    setIsAddingCart(true);
    setActionError('');
    const res = await addToCart(product._id);
    if (!res.success) {
      setActionError(res.message || 'Unable to add product to cart');
    }
    setIsAddingCart(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <main className="home-container">
          <div className="state-card glass-card">
            <div className="state-icon">⚠️</div>
            <h2>Product Not Found</h2>
            <p>The requested product details could not be loaded.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Back to Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar customer={customer} />

      <main className="home-container">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '24px' }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="product-details-container glass-card">
          <div className="product-details-image">
            <span className="product-badge-lg">{product.category}</span>
            <span className="product-large-icon">{product.image || '📦'}</span>
          </div>

          <div className="product-details-info">
            <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>{product.name}</h1>
            <div className="product-price-lg">₹{product.price?.toLocaleString()}</div>

            <p className="product-details-desc">{product.description}</p>

            <div className="stock-info" style={{ marginBottom: '24px' }}>
              {product.stock > 0 ? (
                <span className="stock-in font-weight-600" style={{ color: 'var(--accent-emerald)' }}>
                  ✓ In Stock ({product.stock} units left)
                </span>
              ) : (
                <span className="stock-out" style={{ color: 'var(--accent-rose)' }}>
                  ✕ Currently Out of Stock
                </span>
              )}
            </div>

            {actionError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {actionError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={isAddingCart || product.stock <= 0}
              >
                {isAddingCart
                  ? 'Adding...'
                  : product.stock <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
              <button
                type="button"
                className={`btn ${isInWishlist ? 'btn-wishlist-active' : 'btn-outline'}`}
                onClick={handleWishlistToggle}
                disabled={isSaving}
              >
                {isSaving
                  ? '⏳ Saving...'
                  : isInWishlist
                  ? '♥ Added to Wishlist'
                  : '♡ Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;
