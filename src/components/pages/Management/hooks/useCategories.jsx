import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  deleteMultipleCategories,
} from '../services/managementService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      // Error is already handled in the service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (categoryData) => {
    try {
      await addCategory(categoryData);
      fetchCategories();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      await updateCategory(categoryId, categoryData);
      fetchCategories();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchCategories();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const handleDeleteMultipleCategories = async (categoryIds) => {
    try {
      await deleteMultipleCategories(categoryIds);
      fetchCategories();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const handleUpdateCategoryStatus = async (categoryId, status) => {
    try {
      await updateCategoryStatus(categoryId, status);
      fetchCategories();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    categories: filteredCategories,
    loading,
    searchTerm,
    setSearchTerm,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    deleteMultipleCategories: handleDeleteMultipleCategories,
    updateStatus: handleUpdateCategoryStatus,
    fetchCategories,
  };
};
