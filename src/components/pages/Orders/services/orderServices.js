import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

export const orderService = {
  fetchOrders: () => axios.get(API_URL),
  fetchFactories: () =>
    axios.get(`${import.meta.env.VITE_API_URL}/api/factories`),
  fetchCategories: () =>
    axios.get(`${import.meta.env.VITE_API_URL}/api/categories`),
  fetchModels: () => axios.get(`${import.meta.env.VITE_API_URL}/api/models`),
  createOrder: (orderData) => axios.post(API_URL, orderData),
  checkDuplicates: (serialNumbers) => axios.post(`${API_URL}/check-duplicates`, { serialNumbers }),
  updateOrder: (id, orderData) => axios.patch(`${API_URL}/${id}`, orderData),
  deleteOrder: (id) => axios.delete(`${API_URL}/${id}`),
  deleteMultipleOrders: (ids) => axios.delete(API_URL, { data: { ids } }),
  updateOrderStatus: (id, status) =>
    axios.patch(`${API_URL}/${id}/status`, { status }),
  markOrderAsDispatched: (id) => axios.put(`${API_URL}/${id}/dispatch`),
  bulkUpdateOrderStatus: (factoryId, itemIds, status) =>
    axios.patch(
      `${import.meta.env.VITE_API_URL}/api/factories/${factoryId}/orders/bulk-status`,
      { itemIds, status }
    ),
  fetchOrderStats: (id) => axios.get(`${API_URL}/${id}/factory-stats`),
  fetchOrderItems: (id) => axios.get(`${API_URL}/${id}/items`),
  fetchAllOrderItems: () => axios.get(`${API_URL}/items`),
};
