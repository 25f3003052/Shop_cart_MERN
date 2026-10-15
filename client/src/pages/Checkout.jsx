import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function StripePaymentForm({ orderId, onSuccess, onCancel, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Stripe payment failed.');
        setSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onSuccess({
          orderId,
          paymentProvider: 'stripe',
          paymentIntentId: paymentIntent.id,
        });
      } else {
        onError('Payment is still pending or failed. Please try again.');
      }
    } catch (err) {
      onError(err.message || 'Something went wrong with Stripe payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shipping-form glass-card">
      <h2 className="form-section-title">Payment Details</h2>
      <PaymentElement />
      <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !stripe}>
          {submitting ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}

function Checkout() {
  const [customer, setCustomer] = useState(null);
  const { cartItems, subtotal, clearCartState, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get('/customers/me');
        setCustomer(res.data);
        setFormData((prev) => ({
          ...prev,
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
        }));
      } catch (err) {
        navigate('/login');
      }
    };
    fetchCustomer();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, phone, addressLine1, city, state, pincode } = formData;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      return 'All shipping address fields are required.';
    }

    const digits = phone.trim().replace(/\D/g, '');
    if (digits.length < 10) {
      return 'Please enter a valid phone number with at least 10 digits.';
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return 'Pincode must contain exactly 6 digits.';
    }

    return null;
  };

  const processVerifyPayment = async (paymentData) => {
    try {
      const verifyRes = await api.post('/orders/verify-payment', paymentData);

      if (verifyRes.data && verifyRes.data.success) {
        clearCartState();
        navigate(`/orders/${paymentData.orderId}`);
      } else {
        setFormError('Payment verification failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      setIsProcessing(false);
      const msg = err.response?.data?.message || 'Payment verification failed.';
      setFormError(msg);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const {
        orderId,
        paymentProvider,
        razorpayOrderId,
        amount,
        currency,
        key,
        clientSecret,
        publishableKey,
        mockPayment,
      } = response.data;

      if (paymentProvider === 'stripe' && clientSecret && publishableKey) {
        setStripeClientSecret(clientSecret);
        setStripeEnabled(true);
        setShowStripeForm(true);
        setActiveOrderId(orderId);
        setIsProcessing(false);
        return;
      }

      if (mockPayment || !key || String(razorpayOrderId || '').startsWith('order_mock_')) {
        await processVerifyPayment({
          orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpayOrderId: razorpayOrderId || `order_mock_${Date.now()}`,
          razorpaySignature: 'test_mock_signature',
        });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setIsProcessing(false);
        setFormError('Unable to load the payment gateway. Please try again.');
        return;
      }

      const options = {
        key,
        amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: 'Payment for your order',
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: customer?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (rzpResponse) {
          await processVerifyPayment({
            orderId,
            razorpayPaymentId: rzpResponse.razorpay_payment_id,
            razorpayOrderId: rzpResponse.razorpay_order_id || razorpayOrderId,
            razorpaySignature: rzpResponse.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setFormError('Payment was cancelled. Your cart items are still saved.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      setIsProcessing(false);
      const msg = err.response?.data?.message || 'Failed to initiate payment. Please try again.';
      setFormError(msg);
    }
  };

  const stripeHandleSuccess = async (paymentData) => {
    setShowStripeForm(false);
    setStripeEnabled(false);
    setStripeClientSecret('');
    setActiveOrderId(null);
    await processVerifyPayment({
      ...paymentData,
      paymentProvider: 'stripe',
    });
  };

  const stripeHandleCancel = () => {
    setShowStripeForm(false);
    setStripeEnabled(false);
    setStripeClientSecret('');
    setActiveOrderId(null);
    setFormError('Stripe payment was cancelled.');
    setIsProcessing(false);
  };

  if (cartLoading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <div className="page-loading-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar customer={customer} />
        <main className="home-container">
          <div className="state-card glass-card">
            <div className="state-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add products to your cart before proceeding to checkout.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Browse Products
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
          onClick={() => navigate('/cart')}
        >
          ← Back to Cart
        </button>

        <h1 className="section-title" style={{ marginBottom: '24px' }}>
          Checkout & Shipping Details
        </h1>

        {formError && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            {formError}
          </div>
        )}

        {showStripeForm && stripeEnabled && stripeClientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeClientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#6366f1',
                },
              },
            }}
          >
            <StripePaymentForm
              orderId={activeOrderId || ''}
              onSuccess={stripeHandleSuccess}
              onCancel={stripeHandleCancel}
              onError={(msg) => setFormError(msg)}
            />
          </Elements>
        ) : (
          <div className="checkout-layout">
            <form className="shipping-form glass-card" onSubmit={handlePlaceOrder}>
              <h2 className="form-section-title">Shipping Address</h2>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="123 Main Street, Apt 4B"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pincode * (6 digits)</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ marginTop: '24px' }}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Processing Payment...' : 'Proceed to Payment'}
              </button>
            </form>

            <div className="checkout-summary glass-card">
              <h2 className="summary-title">Order Review ({cartItems.length} items)</h2>

              <div className="checkout-items-list">
                {cartItems.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  return (
                    <div key={p._id} className="checkout-item">
                      <span className="checkout-item-icon">{p.image || '📦'}</span>
                      <div className="checkout-item-details">
                        <div className="checkout-item-name">{p.name}</div>
                        <div className="checkout-item-sub">
                          Qty: {item.quantity} × ₹{p.price?.toLocaleString()}
                        </div>
                      </div>
                      <div className="checkout-item-total">
                        ₹{(p.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total Payable</span>
                <span className="gradient-text">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Checkout;
