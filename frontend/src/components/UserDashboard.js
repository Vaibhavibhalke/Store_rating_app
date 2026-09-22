import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../utils/api';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [ratingModal, setRatingModal] = useState({ show: false, storeId: null, currentRating: null });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });

  useEffect(() => {
    loadStores();
  }, [searchTerm, sortConfig]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await api.getUserStores({ 
        search: searchTerm, 
        sortBy: sortConfig.key, 
        sortOrder: sortConfig.direction 
      });
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
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

  const handleRatingSubmit = async (rating) => {
    try {
      const response = await api.submitRating(ratingModal.storeId, rating);
      if (response.error) {
        alert(response.error);
      } else {
        alert(response.message);
        setRatingModal({ show: false, storeId: null, currentRating: null });
        loadStores();
      }
    } catch (error) {
      alert('Error submitting rating');
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ASC' ? 'DESC' : 'ASC';
    setSortConfig({ key, direction });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '★' : '☆');
    }
    return stars.join('');
  };

  const renderRatingButtons = (storeId, userRating) => {
    return (
      <div className="rating-buttons">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`btn ${userRating === star ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRatingSubmit(star)}
            style={{ margin: '0 2px', padding: '5px 10px' }}
          >
            {star}★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <div className="container header-content">
          <h1>Store Rating App</h1>
          <div className="nav-links">
            <span>Welcome, {user?.name}</span>
            <a onClick={() => setShowPasswordUpdate(true)}>Update Password</a>
            <a onClick={logout}>Logout</a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Browse Stores</h2>
        
        <div className="search-bar" style={{ marginTop: '20px' }}>
          <input
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
          <div className="loading">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>No stores found</div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <button className="btn btn-secondary" onClick={() => handleSort('name')}>
                Sort by Name {sortConfig.key === 'name' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleSort('address')}>
                Sort by Address {sortConfig.key === 'address' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}
              </button>
              <button className="btn btn-secondary" onClick={() => handleSort('average_rating')}>
                Sort by Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}
              </button>
            </div>
            
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <h3>{store.name}</h3>
                <p className="address">{store.address}</p>
                
                <div className="rating-info">
                  <span className="rating-stars">{renderStars(store.average_rating)}</span>
                  <span> ({store.total_ratings} ratings)</span>
                </div>

                {store.user_rating && (
                  <div className="user-rating">
                    <strong>Your Rating:</strong> {renderStars(store.user_rating)}
                  </div>
                )}

                <div>
                  <strong>Rate this store:</strong>
                  {renderRatingButtons(store.id, store.user_rating)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
