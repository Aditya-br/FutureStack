import axios from 'axios';
import { toast } from 'react-toastify';

// API base URL - uses environment variable or defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// Token getter function - will be set by the auth hook
let getAuthToken = null;

/**
 * Set the token getter function (called from useAuthToken hook)
 */
export const setAuthTokenGetter = (getter) => {
    getAuthToken = getter;
};

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        if (getAuthToken) {
            try {
                const token = await getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error getting auth token:', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling with toast notifications
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error;

        switch (status) {
            case 401:
                toast.error('Session expired. Please sign in again.');
                // Redirect to home after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
                break;
            case 403:
                toast.error('You don\'t have permission to do that.');
                break;
            case 404:
                toast.error(message || 'Resource not found.');
                break;
            case 422:
                toast.error(message || 'Invalid data provided.');
                break;
            case 500:
                toast.error('Server error. Please try again later.');
                break;
            default:
                if (status >= 400) {
                    toast.error(message || 'Something went wrong.');
                }
        }

        return Promise.reject(error);
    }
);

/**
 * Opportunity Service - CRUD operations
 */
export const opportunityService = {
    // Get all opportunities for the authenticated user
    getAll: async () => {
        const response = await api.get('/opportunities');
        return response.data;
    },

    // Get a single opportunity by ID
    getById: async (id) => {
        const response = await api.get(`/opportunities/${id}`);
        return response.data;
    },

    // Create a new opportunity
    create: async (data) => {
        const response = await api.post('/opportunities', data);
        return response.data;
    },

    // Update an existing opportunity (partial update)
    update: async (id, data) => {
        const response = await api.patch(`/opportunities/${id}`, data);
        return response.data;
    },

    // Delete an opportunity
    delete: async (id) => {
        const response = await api.delete(`/opportunities/${id}`);
        return response.data;
    }
};

/**
 * Analytics Service
 */
export const analyticsService = {
    // Get analytics data for the authenticated user
    getAnalytics: async () => {
        const response = await api.get('/analytics');
        return response.data;
    }
};

/**
 * Health check
 */
export const healthCheck = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;
