import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'normal_user' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_id: '' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stores') loadStores();
  }, [activeTab, filters, sortConfig]);

  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({ ...filters, sortBy: sortConfig.key, sortOrder: sortConfig.direction });
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await api.getStores({ ...filters, sortBy: sortConfig.key, sortOrder: sortConfig.direction });
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.addUser(newUser);
      if (response.error) {
        alert(response.error);
      } else {
        alert('User added successfully');
        setShowAddUser(false);
        setNewUser({ name: '', email: '', password: '', address: '', role: 'normal_user' });
        loadUsers();
        loadDashboardData();
      }
    } catch (error) {
      alert('Error adding user');
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const response = await api.addStore(newStore);
      if (response.error) {
        alert(response.error);
      } else {
        alert('Store added successfully');
        setShowAddStore(false);
        setNewStore({ name: '', email: '', address: '', owner_id: '' });
        loadStores();
        loadDashboardData();
      }
    } catch (error) {
      alert('Error adding store');
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

  return (
    <div className="container">
      <div className="header">
        <div className="container header-content">
          <h1>Admin Dashboard</h1>
          <div className="nav-links">
            <span>Welcome, {user?.name}</span>
            <a onClick={logout}>Logout</a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stores')}>Stores</button>
      </div>

      {activeTab === 'dashboard' && dashboardData && (
        <div className="dashboard-stats" style={{ marginTop: '30px' }}>
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="value">{dashboardData.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <div className="value">{dashboardData.totalStores}</div>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <div className="value">{dashboardData.totalRatings}</div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Users</h2>
            <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>Add User</button>
          </div>

          <div className="search-bar">
            <input
              placeholder="Filter by name, email, address, or role"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {showAddUser && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Add User</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {sortConfig.key === 'address' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('role')}>Role {sortConfig.key === 'role' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || '-'}</td>
                    <td>{user.role}</td>
                    <td>{user.role === 'store_owner' ? renderStars(user.average_rating) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Stores</h2>
            <button className="btn btn-primary" onClick={() => setShowAddStore(true)}>Add Store</button>
          </div>

          <div className="search-bar">
            <input
              placeholder="Filter by name, email, or address"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {showAddStore && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Add New Store</h3>
              <form onSubmit={handleAddStore}>
                <div className="form-group">
                  <label>Store Name:</label>
                  <input
                    type="text"
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newStore.email}
                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Owner ID:</label>
                  <input
                    type="number"
                    value={newStore.owner_id}
                    onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Store</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStore(false)}>Cancel</button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading stores...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {sortConfig.key === 'address' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                  <th>Owner</th>
                  <th onClick={() => handleSort('average_rating')}>Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'ASC' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>{store.owner_name}</td>
                    <td>{renderStars(store.average_rating)} ({store.total_ratings})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
