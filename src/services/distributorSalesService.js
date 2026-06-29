import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor-sales`;

export const distributorSalesService = {
  getDealerSales: (distributorId) => {
    return axios.get(`${API_URL}/dealer-sales/${distributorId}`);
  },
  getCustomerSales: (distributorId) => {
    return axios.get(`${API_URL}/customer-sales/${distributorId}`);
  },
};
