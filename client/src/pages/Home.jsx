import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function Home() {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, productsRes, wishlistRes, ordersRes] = await Promise.all([
          api.get('/customers/me'),
          api.get('/products'),
          api.get('/wishlist').catch(() => ({ data: { wishlist: [] } })),
          api.get('/orders').catch(() => ({ data: { orders: [] } })),
        ]);

        setCustomer(userRes.data);

        if (productsRes.data && Array.isArray(productsRes.data.products)) {
          setProducts(productsRes.data.products);
        }

        if (wishlistRes.data && Array.isArray(wishlistRes.data.wishlist)) {
          const ids = new Set(wishlistRes.data.wishlist.map((item) => item._id));
          setWishlistIds(ids);
        }

        if (ordersRes.data && Array.isArray(ordersRes.data.orders)) {
          setOrderCount(ordersRes.data.orders.length);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleWishlistToggle = (productId, isAdded) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isAdded) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  if (loading || !customer) {
    return (
      <div className="page-loading-wrapper">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar customer={customer} />

      <main className="home-container">
        {/* Hero Section */}
        <section className="dashboard-hero glass-card">
          <div className="hero-welcome">
            <h1>
              Welcome back, <span className="gradient-text">{customer.fullName}</span> 👋
            </h1>
            <p>
              Explore our curated collection of premium products and manage your profile settings.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value gradient-text">{orderCount}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
                {cartCount}
              </div>
              <div className="stat-label">Items in Cart</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                850
              </div>
              <div className="stat-label">Reward Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                VIP
              </div>
              <div className="stat-label">Membership Tier</div>
            </div>
          </div>
        </section>

        {/* Customer Profile Overview Section */}
        <section className="profile-section">
          <h2 className="section-title">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Customer Profile Overview
          </h2>

          <div className="profile-card glass-card">
            <div className="profile-big-avatar">{getInitial(customer.fullName)}</div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{customer.fullName}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{customer.email}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{customer.phone}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Account Status</span>
                <span
                  className="detail-value"
                  style={{
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent-emerald)',
                    }}
                  ></span>
                  Verified Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Showcase Section */}
        <section className="catalog-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              Featured Products Catalog
            </h2>

            <div className="category-filter">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                initialInWishlist={wishlistIds.has(product._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
