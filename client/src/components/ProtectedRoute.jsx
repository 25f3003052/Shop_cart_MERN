import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ProtectedRoute({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const response = await api.get('/customers/me');
        if (isMounted) {
          setCustomer(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          navigate('/login');
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Authenticating session...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return typeof children === 'function' ? children(customer) : children;
}

export default ProtectedRoute;
