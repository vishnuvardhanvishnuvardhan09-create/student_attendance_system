import axios from 'axios';

/**
 * Central API Client for Spring Boot Backend.
 * BaseURL defaults to http://localhost:8080/api.
 * Offline LocalStorage fallback interceptors will be attached here in subsequent enhancements.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gracefully reject error for caller handling without unhandled console spam
    return Promise.reject(error);
  }
);

export default apiClient;
