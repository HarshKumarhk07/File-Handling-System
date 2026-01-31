import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const API = axios.create({
    baseURL: getBaseUrl(),
});

// Interceptor to add token to requests
API.interceptors.request.use((config) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    } catch (_) {
        localStorage.removeItem('user');
    }
    return config;
});

// Interceptor to handle 401 responses (Token expired/invalid)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if 401 and NOT on the login page (to avoid loop/refresh during login attempts)
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/';
        const isLoginRequest = error.config.url.includes('/auth/login');

        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('user');
            if (!isLoginPage) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
