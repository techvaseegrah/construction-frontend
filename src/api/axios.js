import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // Fallback for safety
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage only if not already set by AuthContext
    // This part ensures that if AuthContext already set it, it's not overwritten/re-fetched.
    // However, the AuthContext should be the primary source for setting this.
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure the token is always prefixed with 'Bearer '
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiry or invalidation (optional but good for robustness)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized response, and it's not the login request itself,
    // it might mean the token is expired or invalid.
    if (error.response && error.response.status === 401 && error.config.url !== '/auth/login') {
      // This is a common pattern for automatically logging out on 401.
      // However, it's often better to handle this in AuthContext or specific components
      // to avoid circular dependencies with `AuthContext` here.
      // For now, AuthContext's `checkAuthStatus` handles it.
    }
    return Promise.reject(error);
  }
);

export default API;
