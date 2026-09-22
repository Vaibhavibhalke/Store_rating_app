import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
    }

    if (formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.address
      );
      
      if (response.error) {
        setErrors({ general: response.error });
      } else {
        login(response.token, response.user);
        navigate('/user');
      }
    } catch (err) {
      setErrors({ general: 'Signup failed. Please try again.' });
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
        <h2 style={{ marginBottom: '20px' }}>Sign Up</h2>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name (20-60 characters):</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password (8-16 chars, 1 uppercase, 1 special):</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label>Address (max 400 characters):</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <div className="error">{errors.address}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
