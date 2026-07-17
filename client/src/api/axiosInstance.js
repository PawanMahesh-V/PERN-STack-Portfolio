import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('portfolio_token');
      localStorage.removeItem('portfolio_user');
      // Redirect to login if on an admin page
      if (window.location.pathname.startsWith('/phantom')) {
        window.location.href = '/phantom';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
