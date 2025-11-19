import apiClient from './api';

export const masterService = {
  async getRegions() {
    const response = await apiClient.get('/master/regions');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async getStyles() {
    const response = await apiClient.get('/master/styles');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async getCategories() {
    const response = await apiClient.get('/master/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async getFeatures() {
    const response = await apiClient.get('/master/features');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },
};

