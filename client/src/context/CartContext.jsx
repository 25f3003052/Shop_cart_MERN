import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setCartItems([]);
      } else {
        setError('Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const response = await api.post(`/cart/${productId}`);
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity });
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message: msg };
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  // Derived Values
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const value = {
    cartItems,
    cartCount,
    subtotal,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    clearCartState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
