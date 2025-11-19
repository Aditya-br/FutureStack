import axios from 'axios';
import { getSampleData } from '../data/sampleData';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo mode state
let isDemoMode = false;
let demoData = [];

// Initialize demo data from localStorage or sample data
const initDemoData = () => {
  const stored = localStorage.getItem('futurestack_demo_data');
  if (stored) {
    try {
      demoData = JSON.parse(stored);
    } catch (e) {
      demoData = getSampleData();
    }
  } else {
    demoData = getSampleData();
  }
  saveDemoData();
};

// Save demo data to localStorage
const saveDemoData = () => {
  localStorage.setItem('futurestack_demo_data', JSON.stringify(demoData));
};

// Check if backend is available
const checkBackendAvailability = async () => {
  try {
    await api.get('/opportunities', { timeout: 2000 });
    isDemoMode = false;
    return true;
  } catch (error) {
    isDemoMode = true;
    initDemoData();
    return false;
  }
};

// Initialize on load
checkBackendAvailability();

// Error handling wrapper
const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    console.error('Network Error - Switching to demo mode');
    isDemoMode = true;
    initDemoData();
    throw new Error('DEMO_MODE');
  } else {
    console.error('Error:', error.message);
    throw new Error(error.message);
  }
};

export const opportunityService = {
  // Get all opportunities
  getAll: async () => {
    try {
      if (isDemoMode) {
        return Promise.resolve([...demoData]);
      }
      const response = await api.get('/opportunities');
      return response.data;
    } catch (error) {
      try {
        handleApiError(error);
      } catch (e) {
        if (e.message === 'DEMO_MODE') {
          return Promise.resolve([...demoData]);
        }
        throw e;
      }
    }
  },

  // Get single opportunity by ID
  getById: async (id) => {
    try {
      if (isDemoMode) {
        const item = demoData.find(opp => opp.id === id);
        return Promise.resolve(item || null);
      }
      const response = await api.get(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      try {
        handleApiError(error);
      } catch (e) {
        if (e.message === 'DEMO_MODE') {
          const item = demoData.find(opp => opp.id === id);
          return Promise.resolve(item || null);
        }
        throw e;
      }
    }
  },

  // Create new opportunity
  create: async (data) => {
    try {
      if (isDemoMode) {
        const newItem = {
          ...data,
          id: String(Date.now()),
        };
        demoData.push(newItem);
        saveDemoData();
        return Promise.resolve(newItem);
      }
      const response = await api.post('/opportunities', data);
      return response.data;
    } catch (error) {
      try {
        handleApiError(error);
      } catch (e) {
        if (e.message === 'DEMO_MODE') {
          const newItem = {
            ...data,
            id: String(Date.now()),
          };
          demoData.push(newItem);
          saveDemoData();
          return Promise.resolve(newItem);
        }
        throw e;
      }
    }
  },

  // Update existing opportunity
  update: async (id, data) => {
    try {
      if (isDemoMode) {
        const index = demoData.findIndex(opp => opp.id === id);
        if (index !== -1) {
          demoData[index] = { ...demoData[index], ...data };
          saveDemoData();
          return Promise.resolve(demoData[index]);
        }
        return Promise.resolve(null);
      }
      const response = await api.patch(`/opportunities/${id}`, data);
      return response.data;
    } catch (error) {
      try {
        handleApiError(error);
      } catch (e) {
        if (e.message === 'DEMO_MODE') {
          const index = demoData.findIndex(opp => opp.id === id);
          if (index !== -1) {
            demoData[index] = { ...demoData[index], ...data };
            saveDemoData();
            return Promise.resolve(demoData[index]);
          }
          return Promise.resolve(null);
        }
        throw e;
      }
    }
  },

  // Delete opportunity
  delete: async (id) => {
    try {
      if (isDemoMode) {
        demoData = demoData.filter(opp => opp.id !== id);
        saveDemoData();
        return Promise.resolve({ success: true });
      }
      const response = await api.delete(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      try {
        handleApiError(error);
      } catch (e) {
        if (e.message === 'DEMO_MODE') {
          demoData = demoData.filter(opp => opp.id !== id);
          saveDemoData();
          return Promise.resolve({ success: true });
        }
        throw e;
      }
    }
  },
};

export default api;
