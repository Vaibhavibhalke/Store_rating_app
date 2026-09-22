import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../utils/api';

const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getStoreOwnerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.updatePassword(newPassword);
      if (response.error) {
        alert(response.error);
      } else {
        alert('Password updated successfully');
        setShowPasswordUpdate(false);
        setNewPassword('');
      }
    } catch (error) {
      alert('Error updating password');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '★' : '☆');
    }
    return stars.join('');
  };

  return (
    <div className="container">
      <div className="header">
        <div className="container header-content">
          <h1>Store Owner Dashboard</h1>
          <div className="nav-links">
            <span>Welcome, {user?.name}</span>
            <a onClick={() => setShowPasswordUpdate(true)}>Update Password</a>
            <a onClick={logout}>Logout</a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>My Store Dashboard</h2>

        {showPasswordUpdate && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Update Password</h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>New Password (8-16 chars, 1 uppercase, 1 special):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordUpdate(false)}>Cancel</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : dashboardData ? (
          <div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Store Name</h3>
                <div className="value" style={{ fontSize: '24px' }}>{dashboardData.store.name}</div>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <div className="value">{renderStars(dashboardData.average_rating)} ({dashboardData.average_rating.toFixed(1)})</div>
              </div>
              <div className="stat-card">
                <h3>Total Ratings</h3>
                <div className="value">{dashboardData.total_ratings}</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '30px' }}>
              <h3>Store Details</h3>
              <p><strong>Email:</strong> {dashboardData.store.email}</p>
              <p><strong>Address:</strong> {dashboardData.store.address}</p>
            </div>

            <div className="card" style={{ marginTop: '30px' }}>
              <h3>User Ratings</h3>
              {dashboardData.ratings.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>No ratings yet</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>User Email</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ratings.map(rating => (
                      <tr key={rating.id}>
                        <td>{rating.user_name}</td>
                        <td>{rating.user_email}</td>
                        <td>{renderStars(rating.rating)} ({rating.rating})</td>
                        <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="error-message">No store found for this owner</div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
