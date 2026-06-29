import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;
const FACTORIES_API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;
const CATEGORIES_API_URL = `${import.meta.env.VITE_API_URL}/api/categories`;
const MODELS_API_URL = `${import.meta.env.VITE_API_URL}/api/models`;

export const orderService = {
  // Orders
  fetchOrders: () => axios.get(API_URL),
  createOrder: (data) => axios.post(API_URL, data),
  updateOrder: (id, data) => axios.patch(`${API_URL}/${id}`, data),
  deleteOrder: (id) => axios.delete(`${API_URL}/${id}`),
  updateOrderStatus: (id, status) =>
    axios.patch(`${API_URL}/${id}/status`, { status }),

  // Order Details
  fetchOrderStats: (id) => axios.get(`${API_URL}/${id}/factory-stats`),
  fetchOrderItems: (id) => axios.get(`${API_URL}/${id}/items`),
  transferToProducts: (orderIds) =>
    axios.post(`${API_URL}/convert-to-products`, { orderIds }),

  // Master Data
  fetchFactories: () => axios.get(FACTORIES_API_URL),
  fetchCategories: () => axios.get(CATEGORIES_API_URL),
  fetchModels: () => axios.get(MODELS_API_URL),
};
