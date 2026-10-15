import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, orderRes] = await Promise.all([
        api.get('/customers/me'),
        api.get(`/orders/${id}`),
      ]);
      setCustomer(userRes.data);
      if (orderRes.data && orderRes.data.order) {
        setOrder(orderRes.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
        return;
      }
      const msg = err.response?.data?.message || 'Unable to load order details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <main className="home-container">
          <div className="state-card glass-card">
            <div className="state-icon">⚠️</div>
            <h2>Order Not Found</h2>
            <p>{error || 'The requested order does not exist or you do not have permission to view it.'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              View My Orders
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar customer={customer} />

      <main className="home-container">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '24px' }}
          onClick={() => navigate('/orders')}
        >
          ← Back to Orders
        </button>

        {order.paymentStatus === 'PAID' && (
          <div className="order-success-banner glass-card">
            <div className="success-icon">✅</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#6ee7b7' }}>Order Placed Successfully!</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Thank you for your purchase. Your order has been saved and is being processed.
              </p>
            </div>
          </div>
        )}

        <div className="order-details-grid">
          <div className="order-main-info glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Order Details</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed on {formattedDate}</div>
              </div>
              <span className={`status-pill ${order.paymentStatus === 'PAID' ? 'status-paid' : 'status-pending'}`}>
                ● {order.status}
              </span>
            </div>

            <div className="order-id-box">
              <span>Order ID:</span> <strong>{order._id}</strong>
            </div>

            {order.razorpayPaymentId && (
              <div className="order-id-box" style={{ marginTop: '8px' }}>
                <span>Payment ID:</span> <strong>{order.razorpayPaymentId}</strong>
              </div>
            )}

            <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '1.1rem' }}>Order Items</h3>

            <div className="order-items-full-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-full-item">
                  <span className="order-item-emoji">{item.image || '📦'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ₹{item.price?.toLocaleString()} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="summary-divider" style={{ margin: '20px 0' }}></div>

            <div className="summary-row summary-total">
              <span>Total Amount Paid</span>
              <span className="gradient-text">₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="order-side-info glass-card">
            <h2 className="summary-title">Shipping Address</h2>
            <div className="shipping-address-box">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
                {order.shippingAddress?.fullName}
              </div>
              <div>{order.shippingAddress?.addressLine1}</div>
              <div>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </div>
              <div style={{ marginTop: '12px', color: 'var(--text-muted)' }}>
                📞 {order.shippingAddress?.phone}
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => navigate('/orders')}
              >
                View My Orders
              </button>

              <button
                type="button"
                className="btn btn-outline btn-full"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;
