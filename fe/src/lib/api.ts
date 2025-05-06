import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// console.log("import.meta.env.VITE_API_BASE_URL",import.meta.env.VITE_API_BASE_URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for session cookies
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api; 