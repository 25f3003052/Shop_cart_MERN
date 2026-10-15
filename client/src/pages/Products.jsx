import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

function Products() {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [userRes, productsRes, wishlistRes] = await Promise.all([
        api.get('/customers/me'),
        api.get('/products'),
        api.get('/wishlist').catch(() => ({ data: { wishlist: [] } })),
      ]);

      setCustomer(userRes.data);

      if (productsRes.data && Array.isArray(productsRes.data.products)) {
        setProducts(productsRes.data.products);
      }

      if (wishlistRes.data && Array.isArray(wishlistRes.data.wishlist)) {
        const ids = new Set(wishlistRes.data.wishlist.map((item) => item._id));
        setWishlistIds(ids);
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
  }, []);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading products catalog...</p>
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
            <h2>Unable to load products.</h2>
            <p>Something went wrong while connecting to the catalog server.</p>
            <button className="btn btn-primary" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    if (!searchQuery) return matchesCategory;
    const haystack = `${p.name || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase();
    return matchesCategory && haystack.includes(searchQuery);
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar customer={customer} />

      <main className="home-container">
        <div className="catalog-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h1 className="section-title" style={{ margin: 0 }}>
                Explore Products
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Find premium gear, tech, and lifestyle items.
              </p>
            </div>

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

          {filteredProducts.length === 0 ? (
            <div className="state-card glass-card">
              <div className="state-icon">🔍</div>
              <h2>No products found</h2>
              <p>Try a different category or search term.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialInWishlist={wishlistIds.has(product._id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Products;
