import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Wishlist() {
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();

  const fetchWishlistData = async () => {
    setLoading(true);
    setError(false);
    setActionError('');
    try {
      const [userRes, wishlistRes] = await Promise.all([
        api.get('/customers/me'),
        api.get('/wishlist'),
      ]);
      setCustomer(userRes.data);
      if (wishlistRes.data && Array.isArray(wishlistRes.data.wishlist)) {
        setWishlist(wishlistRes.data.wishlist);
      } else {
        setWishlist([]);
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
    fetchWishlistData();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId) return;

    setRemovingId(productId);
    setActionError('');

    try {
      await api.delete(`/wishlist/${productId}`);
      // Immediate UI update without page refresh
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      setActionError('Failed to remove product from wishlist. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <main className="home-container">
          <div className="state-card glass-card">
            <div className="state-icon">⚠️</div>
            <h2>Something went wrong.</h2>
            <p>We couldn't load your wishlist.</p>
            <button className="btn btn-primary" onClick={fetchWishlistData}>
              Try Again
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
        <div className="wishlist-header">
          <h1 className="section-title">
            <span style={{ color: 'var(--accent-rose)', marginRight: '8px' }}>❤️</span>
            My Saved Wishlist
          </h1>
          <p className="wishlist-subtitle">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>

        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {actionError}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="state-card glass-card">
            <div className="state-icon" style={{ fontSize: '3.5rem' }}>❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map((product) => (
              <div key={product._id} className="product-card glass-card">
                <div>
                  <div className="product-image-box">
                    <span className="product-badge">{product.category}</span>
                    <span>{product.image || '📦'}</span>
                  </div>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                </div>

                <div className="product-card-details">
                  <div className="stock-tag">
                    {product.stock > 0 ? (
                      <span style={{ color: 'var(--accent-emerald)' }}>
                        ● {product.stock} units left
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-rose)' }}>● Out of stock</span>
                    )}
                  </div>
                </div>

                <div className="product-footer">
                  <div className="product-price">₹{product.price?.toLocaleString()}</div>

                  <div className="product-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewDetails(product._id)}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger-outline"
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                    >
                      {removingId === product._id ? 'Removing...' : 'Remove ♥'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
