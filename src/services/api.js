import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling wrapper
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // Request made but no response received
    console.error('Network Error:', error.request);
    throw new Error('Network error. Please check your connection.');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error(error.message);
  }
};

export const opportunityService = {
  // Get all opportunities
  getAll: async () => {
    try {
      const response = await api.get('/opportunities');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get single opportunity by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Create new opportunity
  create: async (data) => {
    try {
      const response = await api.post('/opportunities', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update existing opportunity
  update: async (id, data) => {
    try {
      const response = await api.patch(`/opportunities/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Delete opportunity
  delete: async (id) => {
    try {
      const response = await api.delete(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default api;
