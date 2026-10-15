import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Orders() {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const [userRes, ordersRes] = await Promise.all([
        api.get('/customers/me'),
        api.get('/orders'),
      ]);
      setCustomer(userRes.data);
      if (ordersRes.data && Array.isArray(ordersRes.data.orders)) {
        setOrders(ordersRes.data.orders);
      } else {
        setOrders([]);
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
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
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
            <h2>Unable to load orders.</h2>
            <p>Something went wrong while retrieving your order history.</p>
            <button className="btn btn-primary" onClick={fetchOrders}>
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
            <span style={{ marginRight: '8px' }}>📦</span>
            My Orders
          </h1>
          <p className="wishlist-subtitle">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="state-card glass-card">
            <div className="state-icon" style={{ fontSize: '3.5rem' }}>📦</div>
            <h2>You have not placed any orders yet.</h2>
            <p>Explore our products and place your first order today!</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={order._id} className="order-card glass-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-id-label">Order #{order._id}</div>
                      <div className="order-date-label">{formattedDate}</div>
                    </div>
                    <div className="order-status-badge">
                      <span
                        className={`status-pill ${
                          order.paymentStatus === 'PAID' ? 'status-paid' : 'status-pending'
                        }`}
                      >
                        ● {order.status} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-preview-item">
                        <span>{item.image || '📦'}</span>
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">× {item.quantity}</span>
                        <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div>
                      <span className="total-label">Total Amount: </span>
                      <span className="total-value">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
