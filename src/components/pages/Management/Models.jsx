import React, { useState } from 'react';
import { Search, Plus, Filter, Trash2 } from 'lucide-react';
import { useModels } from './hooks/useModels';
import { useCategories } from './hooks/useCategories';
import ModelModal from './components/ModelModal';
import ModelsTable from './components/ModelsTable';

const Models = () => {
  const { categories } = useCategories();
  const {
    models,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    addModel,
    updateModel,
    deleteModel,
    updateStatus,
    deleteMultipleModels,
  } = useModels(categories);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModelDetailsModal, setShowModelDetailsModal] = useState(false);
  const [selectedModelForView, setSelectedModelForView] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedModel(null);
    setShowModelModal(true);
  };

  const handleEditClick = (model) => {
    setIsEditing(true);
    setSelectedModel(model);
    setShowModelModal(true);
  };

  const handleModalClose = () => {
    setShowModelModal(false);
    setSelectedModel(null);
    setIsEditing(false);
  };

  const handleSaveModel = async (modelData) => {
    setIsSaving(true);
    let success;
    if (isEditing) {
      success = await updateModel(selectedModel._id, modelData);
    } else {
      success = await addModel(modelData);
    }
    setIsSaving(false);
    return success;
  };

  const handleShowDetails = (model) => {
    setSelectedModelForView(model);
    setShowModelDetailsModal(true);
  };

  const handleSelect = (id) => {
    setSelectedModels((prev) =>
      prev.includes(id)
        ? prev.filter((modelId) => modelId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedModels(models.map((m) => m._id));
    } else {
      setSelectedModels([]);
    }
  };

  const handleDeleteSelected = () => {
    deleteMultipleModels(selectedModels).then(() => {
      setSelectedModels([]);
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Models</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {selectedModels.length > 0 ? (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedModels.length})
            </button>
          ) : (
            <button
              onClick={handleAddClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <ModelsTable
          models={models}
          onEdit={handleEditClick}
          onDelete={deleteModel}
          onStatusChange={updateStatus}
          onShowDetails={handleShowDetails}
          categories={categories}
          selectedModels={selectedModels}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
      <ModelModal
        isOpen={showModelModal}
        onClose={handleModalClose}
        onSave={handleSaveModel}
        model={selectedModel}
        isEditing={isEditing}
        categories={categories}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Models;
