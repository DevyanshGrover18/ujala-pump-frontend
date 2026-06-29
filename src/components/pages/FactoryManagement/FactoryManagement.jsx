import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useFactories } from './hooks/useFactories';
import FactoryList from './components/FactoryList';
import FactoryModal from './components/FactoryModal';
import FactoryOrdersModal from './components/FactoryOrdersModal';

export default function FactoryManagement() {
  const {
    factories,
    loading,
    searchTerm,
    setSearchTerm,
    addFactory,
    updateFactory,
    deleteFactory,
    fetchFactories,
    deleteMultipleFactories,
    isDeleting,
  } = useFactories();
  const [showFactoryModal, setShowFactoryModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFactories, setSelectedFactories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialOrdersTab, setInitialOrdersTab] = useState('all');

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedFactory(null);
    setShowFactoryModal(true);
  };

  const handleEditClick = (factory) => {
    setIsEditing(true);
    setSelectedFactory(factory);
    setShowFactoryModal(true);
  };

  const handleModalClose = () => {
    setShowFactoryModal(false);
    setSelectedFactory(null);
    setIsEditing(false);
  };

  const handleSaveFactory = async (factoryData) => {
    setIsSaving(true);
    let success;
    if (isEditing) {
      success = await updateFactory(selectedFactory._id, factoryData);
    } else {
      success = await addFactory(factoryData);
    }
    if (success) {
      handleModalClose();
    }
    setIsSaving(false);
  };

  const handleViewOrders = (factory, initialTab = 'all') => {
    setSelectedFactory(factory);
    setInitialOrdersTab(initialTab);
    setShowOrdersModal(true);
  };

  const handleSelect = (id) => {
    setSelectedFactories((prev) =>
      prev.includes(id)
        ? prev.filter((factoryId) => factoryId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFactories(factories.map((f) => f._id));
    } else {
      setSelectedFactories([]);
    }
  };

  const handleDeleteSelected = () => {
    deleteMultipleFactories(selectedFactories).then(() => {
      setSelectedFactories([]);
    });
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
            Factory Management
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Factories
                </h2>
                <p className="text-sm text-gray-600">
                  Total {factories.length}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1 sm:flex-initial sm:ml-4">
                <div className="relative flex-1 sm:flex-initial sm:min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search factories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>
                {selectedFactories.length > 0 ? (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white w-full sm:w-auto px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete ({selectedFactories.length})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white w-full sm:w-auto px-4 py-2.5 rounded-lg hover:bg-[#3d45e5] transition-colors text-sm font-medium min-w-[120px]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Factory</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <FactoryList
            factories={factories}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={deleteFactory}
            onViewOrders={handleViewOrders}
            selectedFactories={selectedFactories}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>

      <FactoryModal
        isOpen={showFactoryModal}
        onClose={handleModalClose}
        onSave={handleSaveFactory}
        factory={selectedFactory}
        isEditing={isEditing}
        isSaving={isSaving}
      />

      <FactoryOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        factory={selectedFactory}
        fetchFactories={fetchFactories}
        initialTab={initialOrdersTab}
      />
    </div>
  );
}
