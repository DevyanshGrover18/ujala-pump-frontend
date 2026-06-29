import { useState, useEffect, useCallback } from 'react';
import {
  getModels,
  addModel,
  updateModel,
  deleteModel,
  updateModelStatus,
  deleteMultipleModels,
} from '../services/managementService';

export const useModels = (categories) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getModels();
      setModels(data);
    } catch (error) {
      // Error is already handled in the service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleAddModel = async (modelData) => {
    try {
      await addModel(modelData);
      fetchModels();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateModel = async (modelId, modelData) => {
    try {
      await updateModel(modelId, modelData);
      fetchModels();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      await deleteModel(modelId);
      fetchModels();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const handleDeleteMultipleModels = async (modelIds) => {
    try {
      await deleteMultipleModels(modelIds);
      fetchModels();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const handleUpdateModelStatus = async (modelId, status) => {
    try {
      await updateModelStatus(modelId, status);
      fetchModels();
    } catch (error) {
      // Error is already handled in the service
    }
  };

  const filteredModels = models
    .filter((model) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        model.name?.toLowerCase().includes(searchTermLower) ||
        model.code?.toLowerCase().includes(searchTermLower)
      );
    })
    .filter(
      (model) => !categoryFilter || model.category?._id === categoryFilter
    );

  return {
    models: filteredModels,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    addModel: handleAddModel,
    updateModel: handleUpdateModel,
    deleteModel: handleDeleteModel,
    deleteMultipleModels: handleDeleteMultipleModels,
    updateStatus: handleUpdateModelStatus,
    fetchModels,
  };
};
