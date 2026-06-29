import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

export const productService = {
  fetchProducts: () => axios.get(API_URL),
};
