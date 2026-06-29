import { useState, useEffect, useMemo } from 'react';
import { Filter, Upload } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import ProductIndividualList from './components/ProductIndividualList';
import DistributorSelectionModal from './components/DistributorSelectionModal';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import ProductTable from './components/ProductTable';
import ProductCard from './components/ProductCard';
import ModelModal from './components/ModelModal';
import RangeErrorModal from './components/RangeErrorModal';
import MobileFilterModal from './components/MobileFilterModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import OfflineUploadModal from './components/OfflineUploadModal';
import { Box, Building } from 'lucide-react';
import { getFactories } from '../FactoryManagement/services/factoryService';
import { getModels } from '../Management/services/managementService';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../global/FilterGroup';

const API_URL = import.meta.env.VITE_API_URL;

export default function Products() {
  const [modelFilter, setModelFilter] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [models, setModels] = useState([]);
  const [factories, setFactories] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { products, loading, fetchProducts } = useProducts(
    modelFilter,
    factoryFilter,
    searchTerm
  );

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const modelsData = await getModels();
        setModels(modelsData);
        const factoriesData = await getFactories();
        setFactories(factoriesData);
      } catch (error) {
        toast.error('Failed to fetch models or factories');
      }
    };
    fetchInitialData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setModalCurrentPage(1);
  }, [searchTerm, modelFilter, factoryFilter]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  // Modal for distributor selection (used from inside model detail modal)
  const [isDistributorModalOpen, setIsDistributorModalOpen] = useState(false);
  // Modal for showing products of a particular model
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Modal pagination (for model detail modal)
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');
  // Range validation modal state
  const [rangeErrorModalOpen, setRangeErrorModalOpen] = useState(false);
  const [rangeErrorMessage, setRangeErrorMessage] = useState('');
  const [availableRange, setAvailableRange] = useState('');

  const [boxTypeFilter, setBoxTypeFilter] = useState('');
  const [isOfflineUploadOpen, setIsOfflineUploadOpen] = useState(false);

  const clearFilters = () => {
    setSearchTerm('');
    setModelFilter('');
    setFactoryFilter('');
    setCurrentPage(1);
  };

  // Modal pagination for grouped products inside the model detail modal
  const modalGroupedProducts = useMemo(() => {
    let filtered = products.filter((g) => g.model?._id === activeModelId);

    if (factoryFilter) {
      filtered = filtered.filter((g) =>
        g.productsInBox.some((p) => p.factory?._id === factoryFilter)
      );
    }

    filtered = filtered.filter((g) =>
      g.productsInBox.every((p) => !p.distributor)
    );

    if (boxTypeFilter) {
      filtered = filtered.filter(
        (g) =>
          g.productsInBox.length > 0 &&
          g.productsInBox[0].unitsPerBox === parseInt(boxTypeFilter)
      );
    }

    // Sort by createdAt in descending order (latest to oldest)
    return filtered.sort(
      (a, b) =>
        new Date(b.productsInBox[0].createdAt) -
        new Date(a.productsInBox[0].createdAt)
    );
  }, [products, activeModelId, factoryFilter, boxTypeFilter]);

  // Individual products for the selected model (flattened)
  const modalIndividualProducts = useMemo(() => {
    const flattened = products.flatMap((g) => g.productsInBox || []);
    let list = flattened.filter(
      (p) => p.model?._id === activeModelId && !p.distributor
    );
    if (factoryFilter)
      list = list.filter((p) => p.factory?._id === factoryFilter);
    if (boxTypeFilter)
      list = list.filter((p) => p.unitsPerBox === parseInt(boxTypeFilter));
    return list.sort(
      (a, b) =>
        getSerialCounter(b.serialNumber) - getSerialCounter(a.serialNumber)
    );
  }, [products, activeModelId, factoryFilter, boxTypeFilter]);

  const modalTotalPages = useMemo(
    () => Math.ceil(modalGroupedProducts.length / modalItemsPerPage) || 1,
    [modalGroupedProducts, modalItemsPerPage]
  );

  const paginatedModalProducts = useMemo(() => {
    const indexOfLastItem = modalCurrentPage * modalItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - modalItemsPerPage;
    return modalGroupedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [modalGroupedProducts, modalCurrentPage, modalItemsPerPage]);

  // Pagination for individual products shown in the modal
  const modalTotal =
    Math.ceil(modalIndividualProducts.length / modalItemsPerPage) || 1;
  const paginatedModalIndividualProducts = useMemo(() => {
    const indexOfLastItem = modalCurrentPage * modalItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - modalItemsPerPage;
    return modalIndividualProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [modalIndividualProducts, modalCurrentPage, modalItemsPerPage]);

  const handleProductSelect = (productIds, isSelected) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    if (isSelected) {
      setSelectedProductIds((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const openDistributorModal = () => setIsDistributorModalOpen(true);
  const closeDistributorModal = () => setIsDistributorModalOpen(false);

  const openModelModal = (modelId) => {
    // Clear previous selection when opening model-specific view
    setSelectedProductIds([]);
    setActiveModelId(modelId);
    setIsModelModalOpen(true);
  };

  const closeModelModal = () => {
    setIsModelModalOpen(false);
    setActiveModelId(null);
    setSelectedProductIds([]);
  };

  const handleAssignProducts = async (distributorId) => {
    try {
      await axios.put(`${API_URL}/api/distributor/products/assign`, {
        productIds: selectedProductIds,
        distributorId: distributorId,
      });
      toast.success('Products assigned successfully!');
    } catch (error) {
      toast.error('Error assigning products');
      console.error('Error assigning products:', error);
    } finally {
      closeDistributorModal();
      setSelectedProductIds([]);
      fetchProducts();
    }
  };

  const handleSelectRange = () => {
    if (!startSerialNumber || !endSerialNumber) {
      toast.error('Please enter both start and end serial numbers.');
      return;
    }
    const startCounter = getSerialCounter(startSerialNumber);
    const endCounter = getSerialCounter(endSerialNumber);
    if (startCounter === 0 || endCounter === 0 || startCounter > endCounter) {
      toast.error('Invalid serial number format or range.');
      return;
    }

    // Use filtered products if in modal, otherwise use all products
    const sourceProducts = isModelModalOpen ? modalGroupedProducts : products;

    // Validate against available (unassigned) products
    const available = sourceProducts
      .flatMap((group) => group.productsInBox)
      .filter((product) => !product.distributor);
    const counters = available
      .map((i) => getSerialCounter(i.serialNumber))
      .filter((n) => n > 0);
    if (counters.length > 0) {
      const minCounter = Math.min(...counters);
      const maxCounter = Math.max(...counters);
      if (startCounter < minCounter || endCounter > maxCounter) {
        const sorted = available
          .slice()
          .sort(
            (a, b) =>
              getSerialCounter(a.serialNumber) -
              getSerialCounter(b.serialNumber)
          );
        const minSerial = sorted[0]?.serialNumber || '';
        const maxSerial = sorted[sorted.length - 1]?.serialNumber || '';
        setRangeErrorMessage('Selected range exceeds available range');
        setAvailableRange(`${minSerial} - ${maxSerial}`);
        setRangeErrorModalOpen(true);
        return;
      }
    }

    const selectedProducts = sourceProducts
      .flatMap((group) => group.productsInBox)
      .filter((product) => {
        const itemCounter = getSerialCounter(product.serialNumber);
        return (
          itemCounter >= startCounter &&
          itemCounter <= endCounter &&
          !product.distributor
        );
      });

    if (selectedProducts.length === 0) {
      toast.error('No available products found in the specified range.');
      return;
    }

    const productIds = selectedProducts.map((p) => p._id);
    setSelectedProductIds((prev) => [...new Set([...prev, ...productIds])]);
  };

  const handleUnselectRange = () => {
    if (!startSerialNumber || !endSerialNumber) {
      toast.error(
        'Please enter both start and end serial numbers to unselect.'
      );
      return;
    }
    const startCounter = getSerialCounter(startSerialNumber);
    const endCounter = getSerialCounter(endSerialNumber);
    if (startCounter === 0 || endCounter === 0 || startCounter > endCounter) {
      toast.error('Invalid serial number format or range.');
      return;
    }

    // Use filtered products if in modal, otherwise use all products
    const sourceProducts = isModelModalOpen ? modalGroupedProducts : products;

    // Validate against available (unassigned) products
    const available = sourceProducts
      .flatMap((group) => group.productsInBox)
      .filter((product) => !product.distributor);
    const counters = available
      .map((i) => getSerialCounter(i.serialNumber))
      .filter((n) => n > 0);
    if (counters.length > 0) {
      const minCounter = Math.min(...counters);
      const maxCounter = Math.max(...counters);
      if (startCounter < minCounter || endCounter > maxCounter) {
        const sorted = available
          .slice()
          .sort(
            (a, b) =>
              getSerialCounter(a.serialNumber) -
              getSerialCounter(b.serialNumber)
          );
        const minSerial = sorted[0]?.serialNumber || '';
        const maxSerial = sorted[sorted.length - 1]?.serialNumber || '';
        setRangeErrorMessage('Selected range exceeds available range');
        setAvailableRange(`${minSerial} - ${maxSerial}`);
        setRangeErrorModalOpen(true);
        return;
      }
    }

    const unselectedProductIds = sourceProducts
      .flatMap((group) => group.productsInBox)
      .filter((product) => {
        const itemCounter = getSerialCounter(product.serialNumber);
        return itemCounter >= startCounter && itemCounter <= endCounter;
      })
      .map((p) => p._id);

    if (unselectedProductIds.length === 0) {
      toast.error('No products found in the specified range to unselect.');
      return;
    }

    setSelectedProductIds((prev) =>
      prev.filter((id) => !unselectedProductIds.includes(id))
    );
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  // Build model-level groups from the flattened product list
  const flattenedProducts = useMemo(
    () =>
      products.flatMap((g) => g.productsInBox).filter((p) => !p.distributor),
    [products]
  );

  const modelGroups = useMemo(() => {
    const map = {};
    flattenedProducts.forEach((p) => {
      const mid = p.model?._id || 'unknown';
      if (!map[mid])
        map[mid] = {
          model: p.model || { name: 'Unknown' },
          count: 0,
          products: [],
        };
      map[mid].count += 1;
      map[mid].products.push(p);
    });
    return Object.values(map);
  }, [flattenedProducts]);

  const totalPages = useMemo(
    () => Math.ceil(modelGroups.length / itemsPerPage) || 1,
    [modelGroups, itemsPerPage]
  );
  const paginatedModelGroups = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return modelGroups.slice(indexOfFirstItem, indexOfLastItem);
  }, [modelGroups, currentPage, itemsPerPage]);

  return (
    <div className="p-2 sm:p-4 lg:p-4 min-h-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Inventory
                </h2>
                <p className="text-sm text-gray-600">
                  Total Products: {flattenedProducts.length}
                </p>
              </div>
              {/* <div className="flex-shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={() => setIsOfflineUploadOpen(true)}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload Offline Products
                </button>
              </div> */}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <FilterGroup>
                <FilterItem>
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </FilterItem>
                <FilterItem>
                  <FilterSelector
                    value={modelFilter}
                    onChange={setModelFilter}
                    options={models}
                    placeholder="All Models"
                    icon={Box}
                  />
                </FilterItem>
                <FilterItem>
                  <FilterSelector
                    value={factoryFilter}
                    onChange={setFactoryFilter}
                    options={factories}
                    placeholder="All Factories"
                    icon={Building}
                  />
                </FilterItem>
                <FilterItem>
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    <span>Clear Filters</span>
                  </button>
                </FilterItem>
              </FilterGroup>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden space-y-3">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {flattenedProducts.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="p-4">
            <ProductTable
              modelGroups={paginatedModelGroups}
              onViewModel={(modelId) => {
                setModalCurrentPage(1);
                openModelModal(modelId);
              }}
            />

            <ProductCard
              modelGroups={paginatedModelGroups}
              onViewModel={(modelId) => {
                setModalCurrentPage(1);
                openModelModal(modelId);
              }}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={modelGroups.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
              itemName="models"
            />
          </div>
        )}

        <ModelModal
          isOpen={isModelModalOpen}
          activeModelId={activeModelId}
          models={models}
          modalIndividualProducts={modalIndividualProducts}
          paginatedModalIndividualProducts={paginatedModalIndividualProducts}
          loading={loading}
          selectedProductIds={selectedProductIds}
          onProductSelect={handleProductSelect}
          startSerialNumber={startSerialNumber}
          endSerialNumber={endSerialNumber}
          onStartSerialChange={setStartSerialNumber}
          onEndSerialChange={setEndSerialNumber}
          onSelectRange={handleSelectRange}
          onUnselectRange={handleUnselectRange}
          onClearSelection={handleClearSelection}
          factoryFilter={factoryFilter}
          onFactoryFilterChange={setFactoryFilter}
          factories={factories}
          boxTypeFilter={boxTypeFilter}
          onBoxTypeFilterChange={setBoxTypeFilter}
          modalCurrentPage={modalCurrentPage}
          modalTotal={modalTotal}
          modalItemsPerPage={modalItemsPerPage}
          onPageChange={setModalCurrentPage}
          onItemsPerPageChange={setModalItemsPerPage}
          onClose={closeModelModal}
          onTransferClick={openDistributorModal}
        />

        <DistributorSelectionModal
          isOpen={isDistributorModalOpen}
          onClose={closeDistributorModal}
          onAssign={handleAssignProducts}
        />

        <RangeErrorModal
          isOpen={rangeErrorModalOpen}
          onClose={() => setRangeErrorModalOpen(false)}
          rangeErrorMessage={rangeErrorMessage}
          availableRange={availableRange}
        />
      </div>

      <MobileFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        modelFilter={modelFilter}
        onModelFilterChange={setModelFilter}
        models={models}
        factoryFilter={factoryFilter}
        onFactoryFilterChange={setFactoryFilter}
        factories={factories}
        onClearFilters={clearFilters}
      />
      
      <OfflineUploadModal
        isOpen={isOfflineUploadOpen}
        onClose={() => setIsOfflineUploadOpen(false)}
        onSuccess={() => fetchProducts()}
        models={models}
        factories={factories}
      />
    </div>
  );
}
