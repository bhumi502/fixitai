// services/staffService.js - Staff Member API calls
import api from './api';

export const staffService = {
  // Get staff list with optional filters
  getStaff: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  // Get single staff by ID
  getStaffById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  // Create staff member
  createStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },

  // Delete staff member
  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
};
