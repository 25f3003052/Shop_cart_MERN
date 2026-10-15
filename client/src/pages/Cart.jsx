import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

function Cart() {
  const [customer, setCustomer] = useState(null);
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const {
    cartItems,
    subtotal,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get('/customers/me');
        setCustomer(res.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchCustomer();
  }, [navigate]);

  const handleIncrease = async (item) => {
    if (updatingId || !item.product) return;
    setActionError('');
    if (item.quantity >= item.product.stock) {
      setActionError(`Cannot exceed available stock (${item.product.stock} units)`);
      return;
    }
    setUpdatingId(item.product._id);
    const res = await updateQuantity(item.product._id, item.quantity + 1);
    if (!res.success) {
      setActionError(res.message);
    }
    setUpdatingId(null);
  };

  const handleDecrease = async (item) => {
    if (updatingId || !item.product) return;
    setActionError('');
    if (item.quantity <= 1) {
      setActionError('Quantity cannot be less than 1. Click Remove to remove the product.');
      return;
    }
    setUpdatingId(item.product._id);
    const res = await updateQuantity(item.product._id, item.quantity - 1);
    if (!res.success) {
      setActionError(res.message);
    }
    setUpdatingId(null);
  };

  const handleRemove = async (productId) => {
    if (updatingId) return;
    setActionError('');
    setUpdatingId(productId);
    const res = await removeFromCart(productId);
    if (!res.success) {
      setActionError(res.message);
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your cart...</p>
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
            <h2>Unable to load your cart.</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={refreshCart}>
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
            <span style={{ marginRight: '8px' }}>🛒</span>
            Shopping Cart
          </h1>
          <p className="wishlist-subtitle">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {actionError}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="state-card glass-card">
            <div className="state-icon" style={{ fontSize: '3.5rem' }}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cartItems.map((item) => {
                if (!item.product) return null;
                const p = item.product;
                return (
                  <div key={p._id} className="cart-item-card glass-card">
                    <div className="cart-item-image">
                      <span>{p.image || '📦'}</span>
                    </div>

                    <div className="cart-item-info">
                      <h3 className="cart-item-title">{p.name}</h3>
                      <p className="cart-item-category">{p.category}</p>
                      <div className="cart-item-price">₹{p.price?.toLocaleString()}</div>
                      <div className="stock-tag">
                        {p.stock > 0 ? (
                          <span style={{ color: 'var(--accent-emerald)' }}>
                            ● {p.stock} units available
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-rose)' }}>● Out of stock</span>
                        )}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleDecrease(item)}
                          disabled={updatingId === p._id || item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleIncrease(item)}
                          disabled={updatingId === p._id || item.quantity >= p.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-total">
                        ₹{(p.price * item.quantity).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleRemove(p._id)}
                        disabled={updatingId === p._id}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary-sidebar glass-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span className="summary-amount">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--accent-emerald)' }}>Free</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total Amount</span>
                <span className="gradient-text">₹{subtotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-full"
                style={{ marginTop: '20px' }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
