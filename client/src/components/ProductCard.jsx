import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function ProductCard({ product, initialInWishlist = false, onWishlistToggle }) {
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const prodId = product._id || product.id;

  const cartItem = (cartItems || []).find((item) => {
    const itemProdId = item.product?._id || item.product;
    return itemProdId?.toString() === prodId?.toString();
  });
  const inCart = !!cartItem;

  useEffect(() => {
    setIsInWishlist(initialInWishlist);
  }, [initialInWishlist]);

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (isSavingWishlist || !prodId) return;

    setIsSavingWishlist(true);
    setErrorMessage('');

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${prodId}`);
        setIsInWishlist(false);
        if (onWishlistToggle) {
          onWishlistToggle(prodId, false);
        }
      } else {
        await api.post(`/wishlist/${prodId}`);
        setIsInWishlist(true);
        if (onWishlistToggle) {
          onWishlistToggle(prodId, true);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setIsInWishlist(true);
      } else {
        setErrorMessage('Unable to save product to wishlist. Please try again.');
      }
    } finally {
      setIsSavingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAddingCart || product.stock <= 0 || !prodId) return;

    setIsAddingCart(true);
    setErrorMessage('');

    const res = await addToCart(prodId);
    if (!res.success) {
      setErrorMessage(res.message || 'Unable to add product to cart');
    }
    setIsAddingCart(false);
  };

  const handleViewDetails = () => {
    if (prodId) {
      navigate(`/products/${prodId}`);
    }
  };

  return (
    <div className="product-card glass-card">
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

      {errorMessage && (
        <div className="alert alert-error product-card-error">
          {errorMessage}
        </div>
      )}

      <div className="product-footer" style={{ flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="product-price">₹{product.price?.toLocaleString()}</div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleViewDetails}
            title="View Product Details"
          >
            View Details
          </button>
        </div>

        <div className="product-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${isInWishlist ? 'btn-wishlist-active' : 'btn-outline'}`}
            onClick={handleWishlistClick}
            disabled={isSavingWishlist}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isSavingWishlist ? '⏳ Saving...' : isInWishlist ? '♥ Saved' : '♡ Wishlist'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={isAddingCart || product.stock <= 0}
            title={product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            {isAddingCart ? (
              'Adding...'
            ) : inCart ? (
              'Add Another'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
