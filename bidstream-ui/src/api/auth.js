import axios from 'axios';
import api from './axios';

const API_URL = '/auth'; // Using relative path since base URL is in axios instance

/**
 * Authentication API Service
 * Connects React frontend to Spring Boot identity-service
 */
export const authAPI = {
    /**
     * Register a new user
     * @param {object} data - { firstName, lastName, email, password }
     * @returns {Promise} Response with user data
     */
    register: async (data) => {
        try {
            const response = await api.post(`${API_URL}/register`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Verify OTP for email verification
     * @param {string} email - User email
     * @param {string} otp - OTP code
     * @returns {Promise} Response with accessToken and refreshToken
     */
    verifyOTP: async (email, otp) => {
        try {
            const response = await api.post(`${API_URL}/verify-otp`, { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Login user
     * @param {object} credentials - { email, password }
     * @returns {Promise} Response with accessToken and refreshToken
     */
    login: async (credentials) => {
        try {
            const response = await api.post(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} Response with new accessToken
     */
    refreshToken: async (refreshToken) => {
        try {
            const response = await api.post(`${API_URL}/refresh`, { refreshToken });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Resend OTP
     * @param {string} email - User email
     * @returns {Promise} Response with success message
     */
    resendOTP: async (email) => {
        try {
            const response = await api.post(`${API_URL}/resend-otp`, { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Switch user role in the backend
     * @param {string} email - User email
     * @param {string} role - New role (ROLE_SELLER or ROLE_BIDDER)
     * @returns {Promise}
     */
    switchRole: async (email, role) => {
        try {
            const response = await api.post(`${API_URL}/switch-role`, null, {
                params: { email, role }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Submit seller verification details
     * @param {object} data - Verification details
     * @returns {Promise}
     */
    verifySeller: async (data) => {
        try {
            const response = await api.post(`${API_URL}/verify-seller`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Check if user is a verified seller
     * @param {string} email - User email
     * @returns {Promise<boolean>}
     */
    checkVerification: async (email) => {
        try {
            const response = await api.get(`${API_URL}/check-verification`, {
                params: { email }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user details (fails if user no longer exists in DB)
     * @param {string} userId - User UUID
     * @returns {Promise}
     */
    getUserDetails: async (userId) => {
        const response = await api.get(`${API_URL}/user-details`, {
            params: { userId }
        });
        return response.data;
    }
};

/**
 * Configure axios interceptor for auth tokens
 */
export const setupAuthInterceptor = () => {
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // If 401 and not retried, try to refresh token
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        const response = await authAPI.refreshToken(refreshToken);
                        localStorage.setItem('accessToken', response.accessToken);
                        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                        return axios(originalRequest);
                    } catch (error) {
                        console.error('Token refresh failed:', error);
                        // Refresh failed, logout
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }
                }
            }

            return Promise.reject(error);
        }
    );
};
