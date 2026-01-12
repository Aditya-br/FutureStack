import axios from 'axios';
import { toast } from 'react-toastify';
import { analytics } from '../lib/analytics';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

let getAuthToken = null;

export const setAuthTokenGetter = (getter) => {
    getAuthToken = getter;
};

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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error;

        switch (status) {
            case 401:
                toast.error('Session expired. Please sign in again.');
                setTimeout(() => { window.location.href = '/'; }, 1500);
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

export const opportunityService = {
    getAll: async () => {
        const response = await api.get('/opportunities');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/opportunities/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/opportunities', data);
        // Track opportunity creation
        analytics.opportunityCreated(data.category);
        return response.data;
    },

    update: async (id, data, oldStatus = null) => {
        const response = await api.patch(`/opportunities/${id}`, data);
        // Track status changes if status was updated
        if (data.status && oldStatus && data.status !== oldStatus) {
            analytics.opportunityUpdated(response.data.category, oldStatus, data.status);
        }
        return response.data;
    },

    delete: async (id, category = null) => {
        const response = await api.delete(`/opportunities/${id}`);
        // Track deletion
        if (category) {
            analytics.opportunityDeleted(category);
        }
        return response.data;
    }
};

export const analyticsService = {
    getAnalytics: async () => {
        const response = await api.get('/analytics');
        return response.data;
    }
};

export const healthCheck = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;

