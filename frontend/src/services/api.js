import axios from 'axios';

const explicitApiUrl = import.meta.env.VITE_API_URL?.trim();
const productionApiUrl = 'https://invest-wise-backend.onrender.com/api';

const api = axios.create({
    baseURL: explicitApiUrl || (import.meta.env.PROD ? productionApiUrl : '/api'),
    headers: { 'Content-Type': 'application/json' }
});

// JWT Interceptor — automatically attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 by clearing auth
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
