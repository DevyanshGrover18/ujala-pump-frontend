import React, { useState } from 'react';
import { Search, Plus, Package, Edit, Trash2 } from 'lucide-react';
import { useCategories } from './hooks/useCategories';
import CategoryModal from './components/CategoryModal';
import { getModelsByCategory } from './services/managementService';
import ModelsListModal from './components/ModelsListModal';

const Categories = () => {
  const {
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    addCategory,
    updateCategory,
    deleteCategory,
    updateStatus,
    deleteMultipleCategories,
  } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModelsModal, setShowModelsModal] = useState(false);
  const [categoryModels, setCategoryModels] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleModalClose = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const handleSaveCategory = async (categoryData) => {
    setIsSaving(true);
    let success;
    if (isEditing) {
      success = await updateCategory(selectedCategory._id, categoryData);
    } else {
      success = await addCategory(categoryData);
    }
    setIsSaving(false);
    return success;
  };

  const handleViewModels = async (category) => {
    try {
      const models = await getModelsByCategory(category._id);
      setCategoryModels(models);
      setSelectedCategory(category);
      setShowModelsModal(true);
    } catch (error) {
      // error handled in service
    }
  };

  const handleSelect = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(categories.map((c) => c._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleDeleteSelected = () => {
    deleteMultipleCategories(selectedCategories).then(() => {
      setSelectedCategories([]);
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedCategories.length > 0 ? (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedCategories.length})
            </button>
          ) : (
            <button
              onClick={handleAddClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={
                        categories.length > 0 &&
                        selectedCategories.length === categories.length
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Models
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onChange={() => handleSelect(category._id)}
                        checked={selectedCategories.includes(category._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${category.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}
                        ></div>
                        <select
                          value={category.status}
                          onChange={(e) =>
                            updateStatus(category._id, e.target.value)
                          }
                          className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewModels(category)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-indigo-500 text-xs font-medium rounded text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
                      >
                        <Package className="h-4 w-4 mr-1" />
                        {category.modelCount || 0} Models
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={handleModalClose}
        onSave={handleSaveCategory}
        category={selectedCategory}
        isEditing={isEditing}
        isSaving={isSaving}
      />

      <ModelsListModal
        isOpen={showModelsModal}
        onClose={() => setShowModelsModal(false)}
        category={selectedCategory}
        models={categoryModels}
      />
    </div>
  );
};

export default Categories;
