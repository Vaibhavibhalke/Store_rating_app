import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(formData.email, formData.password);
      
      if (response.error) {
        setError(response.error);
      } else {
        login(response.token, response.user);
        
        // Redirect based on role
        switch (response.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'normal_user':
            navigate('/user');
            break;
          case 'store_owner':
            navigate('/store-owner');
            break;
          default:
            navigate('/login');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="container header-content">
          <h1>Store Rating App</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
