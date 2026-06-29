import axios from 'axios';
import { toast } from 'react-hot-toast';

const CATEGORIES_API_URL = `${import.meta.env.VITE_API_URL}/api/categories`;
const MODELS_API_URL = `${import.meta.env.VITE_API_URL}/api/models`;

// Category services
export const getCategories = async () => {
  try {
    const response = await axios.get(CATEGORIES_API_URL);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 'Error fetching categories';
    toast.error(message);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await axios.post(CATEGORIES_API_URL, categoryData);
    toast.success('Category added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error adding category';
    toast.error(message);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await axios.put(
      `${CATEGORIES_API_URL}/${categoryId}`,
      categoryData
    );
    toast.success('Category updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error updating category';
    toast.error(message);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  if (window.confirm('Are you sure you want to delete this category?')) {
    try {
      await axios.delete(`${CATEGORIES_API_URL}/${categoryId}`);
      toast.success('Category deleted successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Error deleting category';
      toast.error(message);
      throw error;
    }
  }
};

export const deleteMultipleCategories = async (categoryIds) => {
  if (
    window.confirm(
      `Are you sure you want to delete ${categoryIds.length} selected categories?`
    )
  ) {
    try {
      await axios.delete(CATEGORIES_API_URL, { data: { categoryIds } });
      toast.success('Selected categories deleted successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Error deleting selected categories';
      toast.error(message);
      throw error;
    }
  }
};

export const updateCategoryStatus = async (categoryId, status) => {
  try {
    await axios.patch(`${CATEGORIES_API_URL}/${categoryId}/status`, { status });
    toast.success('Category status updated successfully');
  } catch (error) {
    const message =
      error.response?.data?.message || 'Error updating category status';
    toast.error(message);
    throw error;
  }
};

// Model services
export const getModels = async () => {
  try {
    const response = await axios.get(MODELS_API_URL);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error fetching models';
    toast.error(message);
    throw error;
  }
};

export const addModel = async (modelData) => {
  try {
    const response = await axios.post(MODELS_API_URL, modelData);
    toast.success('Model added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error adding model';
    toast.error(message);
    throw error;
  }
};

export const updateModel = async (modelId, modelData) => {
  try {
    const response = await axios.put(`${MODELS_API_URL}/${modelId}`, modelData);
    toast.success('Model updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error updating model';
    toast.error(message);
    throw error;
  }
};

export const deleteModel = async (modelId) => {
  if (window.confirm('Are you sure you want to delete this model?')) {
    try {
      await axios.delete(`${MODELS_API_URL}/${modelId}`);
      toast.success('Model deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting model';
      toast.error(message);
      throw error;
    }
  }
};

export const deleteMultipleModels = async (modelIds) => {
  if (
    window.confirm(
      `Are you sure you want to delete ${modelIds.length} selected models?`
    )
  ) {
    try {
      await axios.delete(MODELS_API_URL, { data: { modelIds } });
      toast.success('Selected models deleted successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Error deleting selected models';
      toast.error(message);
      throw error;
    }
  }
};

export const updateModelStatus = async (modelId, status) => {
  try {
    await axios.patch(`${MODELS_API_URL}/${modelId}/status`, { status });
    toast.success('Model status updated successfully');
  } catch (error) {
    const message =
      error.response?.data?.message || 'Error updating model status';
    toast.error(message);
    throw error;
  }
};

export const getModelsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(
      `${MODELS_API_URL}/category/${categoryId}`
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      'Error fetching models for this category';
    toast.error(message);
    throw error;
  }
};
