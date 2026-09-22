const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  signup: async (name, email, password, address) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, address })
    });
    return response.json();
  },

  updatePassword: async (newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    return response.json();
  },

  // Admin endpoints
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  addUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  addStore: async (storeData) => {
    const response = await fetch(`${API_BASE_URL}/admin/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData)
    });
    return response.json();
  },

  getStores: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/stores?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // User endpoints
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Store endpoints
  getUserStores: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/stores?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getStore: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stores/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Rating endpoints
  submitRating: async (storeId, rating) => {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ store_id: storeId, rating })
    });
    return response.json();
  },

  getStoreOwnerDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/ratings/owner/dashboard`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getMyRatings: async () => {
    const response = await fetch(`${API_BASE_URL}/ratings/my-ratings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
