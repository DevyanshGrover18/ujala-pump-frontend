import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/dealers`;
const DISTRIBUTOR_API_URL = `${import.meta.env.VITE_API_URL}/api/distributors`;

export const dealerService = {
  fetchDealers: async (searchTerm = '') => {
    return await axios.get(
      searchTerm ? `${API_URL}?search=${searchTerm}` : API_URL
    );
  },

  createDealer: async (dealerData) => {
    return await axios.post(API_URL, dealerData);
  },

  updateDealer: async (dealerId, dealerData) => {
    return await axios.put(`${API_URL}/${dealerId}`, dealerData);
  },

  deleteDealer: async (dealerId) => {
    return await axios.delete(`${API_URL}/${dealerId}`);
  },

  fetchDistributors: async () => {
    return await axios.get(DISTRIBUTOR_API_URL);
  },
  fetchSubDealers: async (dealerId) => {
    return await axios.get(`${API_URL}/${dealerId}/sub-dealers`);
  },
};
