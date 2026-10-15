import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function Navbar({ customer }) {
  const navigate = useNavigate();
  const { cartCount, clearCartState } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      clearCartState();
      navigate('/login');
    } catch (err) {
      clearCartState();
      navigate('/login');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-content">
        <Link to="/home" className="nav-brand">
          <div className="nav-brand-icon">S</div>
          <span className="nav-brand-text gradient-text">ShopKart</span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/home"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Products
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Wishlist
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Cart ({cartCount})
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Orders
          </NavLink>
        </nav>

        <form
          className="nav-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const query = searchQuery.trim();
            navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search premium products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          {customer && (
            <div className="user-badge">
              <div className="user-avatar">{getInitial(customer.fullName)}</div>
              <span className="user-name">{customer.fullName}</span>
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={handleLogout}
            title="Log out of your account"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
