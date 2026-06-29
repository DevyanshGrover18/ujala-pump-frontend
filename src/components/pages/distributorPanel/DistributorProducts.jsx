import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DistributorQRScannerModal from '../../global/DistributorQRScannerModal';
import { ProductFilters } from '../Distributors/components/ProductFilters';
import TableExportButtons from '../../global/TableExportButtons';
import SaleModal from '../Dealers/components/SaleModalTwo';
import { Search, Filter, X, Building, Package, Box } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributors`;

export default function DistributorProducts() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');
  const [serialRangeActive, setSerialRangeActive] = useState(false);
  const [factories, setFactories] = useState([]);
  const [models, setModels] = useState([]);

  // Selection states
  const [selectedProductGroups, setSelectedProductGroups] = useState([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Modal states for individual products
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);

  const fetchProducts = async () => {
    if (!user || !user.distributor) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [productsResponse, dealersResponse] = await Promise.all([
        axios.get(`${API_URL}/${user.distributor._id}/products`),
        axios.get(`${API_URL}/${user.distributor._id}/dealers`),
      ]);
      setProducts(productsResponse.data);
      setDealers(dealersResponse.data);

      // Extract unique factories and models from products
      const uniqueFactories = [
        ...new Map(
          productsResponse.data
            .filter((p) => p.factory)
            .map((p) => [p.factory._id, p.factory])
        ).values(),
      ];

      const uniqueModels = [
        ...new Map(
          productsResponse.data
            .filter((p) => p.model)
            .map((p) => [p.model._id, p.model])
        ).values(),
      ];

      setFactories(uniqueFactories);
      setModels(uniqueModels);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, factoryFilter, modelFilter]);

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter products based on search term, factory, model, and serial number range
  const filteredProducts = products
    .filter((product) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearch =
        (product.productName &&
          product.productName.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.serialNumber &&
          product.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.model &&
          product.model.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.factory &&
          product.factory.name.toLowerCase().includes(lowerCaseSearchTerm));

      const matchesFactory =
        factoryFilter === 'all' || product.factory?._id === factoryFilter;
      const matchesModel =
        modelFilter === 'all' || product.model?._id === modelFilter;

      return matchesSearch && matchesFactory && matchesModel;
    })
    .sort(
      (a, b) =>
        getSerialCounter(b.serialNumber) - getSerialCounter(a.serialNumber)
    );

  // Group products by model
  const modelGroups = useMemo(() => {
    const map = {};
    filteredProducts.forEach((p) => {
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
  }, [filteredProducts]);

  // Pagination for model groups
  const modelTotalPages = Math.ceil(modelGroups.length / itemsPerPage);
  const paginatedModelGroups = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return modelGroups.slice(indexOfFirstItem, indexOfLastItem);
  }, [modelGroups, currentPage, itemsPerPage]);

  // Individual products for selected model
  const modalProducts = useMemo(() => {
    const mg = modelGroups.find((g) => g.model?._id === activeModelId);
    return mg ? mg.products : [];
  }, [modelGroups, activeModelId]);

  const modalTotalPages = Math.ceil(modalProducts.length / modalItemsPerPage);
  const paginatedModalProducts = useMemo(() => {
    const indexOfLastItem = modalCurrentPage * modalItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - modalItemsPerPage;
    return modalProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [modalProducts, modalCurrentPage, modalItemsPerPage]);

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

    // Find products in the range and select them
    const productsInRange = filteredProducts.filter((product) => {
      const productCounter = getSerialCounter(product.serialNumber);
      return productCounter >= startCounter && productCounter <= endCounter;
    });

    if (productsInRange.length === 0) {
      toast.error('No products found in the specified range.');
      return;
    }

    // Add to existing selection
    const newSelection = [...selectedProductGroups];
    productsInRange.forEach((product) => {
      if (!newSelection.some((selected) => selected._id === product._id)) {
        newSelection.push(product);
      }
    });

    setSelectedProductGroups(newSelection);
    toast.success(`Selected ${productsInRange.length} products in range`);
  };

  const handleClearRange = () => {
    setStartSerialNumber('');
    setEndSerialNumber('');
    setSerialRangeActive(false);
  };

  const handleAssignToDealer = async () => {
    if (!selectedDealer) {
      toast.error('Please select a dealer');
      return;
    }

    if (selectedProductGroups.length === 0) {
      toast.error('No products selected for assignment.');
      return;
    }

    setIsAssigning(true);
    try {
      for (const product of selectedProductGroups) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/assign`,
          {
            distributorId: user.distributor._id,
            dealerId: selectedDealer,
            productId: product._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      toast.success('Products assigned to dealer successfully');
      setShowAssignModal(false);
      setSelectedProductGroups([]);
      setSelectedDealer('');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning products');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSale = async (customerData) => {
    if (selectedProductGroups.length === 0) return;

    try {
      for (const product of selectedProductGroups) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/sales`, {
          productId: product._id,
          distributorId: user.distributor._id,
          ...customerData,
        });
      }
      toast.success('Products sold successfully');
      setShowSaleModal(false);
      setSelectedProductGroups([]);
      fetchProducts();
    } catch (error) {
      toast.error('Error selling products');
      console.error('Error selling products:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFactoryFilter('all');
    setModelFilter('all');
    handleClearRange();
    setSelectedProductGroups([]);
  };

  const openModelModal = (modelId) => {
    setActiveModelId(modelId);
    setModalCurrentPage(1);
    setIsModelModalOpen(true);
  };

  const closeModelModal = () => {
    setIsModelModalOpen(false);
    setActiveModelId(null);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Inventory
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Total items: {filteredProducts.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TableExportButtons
                exportName="Distributor_Inventory_Models"
                exportData={modelGroups.map(mg => ({
                  'Model Name': mg.model?.name || 'Unknown',
                  'Total Products': mg.products?.length || 0
                }))}
              />
            </div>
            {/* 
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => setShowScannerModal(true)}
                                className="flex items-center justify-center bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                            >
                                <span>Scan Product</span>
                            </button>
                        </div>
                            */}
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block p-3 sm:p-6 border-b border-gray-200">
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            factoryFilter={factoryFilter}
            onFactoryFilterChange={setFactoryFilter}
            modelFilter={modelFilter}
            onModelFilterChange={setModelFilter}
            startSerialNumber={startSerialNumber}
            onStartSerialNumberChange={setStartSerialNumber}
            endSerialNumber={endSerialNumber}
            onEndSerialNumberChange={setEndSerialNumber}
            onSelectRange={handleSelectRange}
            onClearRange={handleClearRange}
            factories={factories}
            models={models}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Mobile Search and Filter Button */}
        <div className="lg:hidden p-3 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
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

        {/* Content */}
        <div className="relative min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
            </div>
          ) : (
            <div className="p-4">
              {modelGroups.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                  No products found matching your filters
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No. of Products
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedModelGroups.map((mg) => (
                          <tr
                            key={mg.model?._id || mg.model.name}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mg.model?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => openModelModal(mg.model?._id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                              >
                                <Box className="h-4 w-4 mr-1" />
                                {mg.products?.length || 0} Total Products
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {paginatedModelGroups.map((mg) => (
                      <div
                        key={mg.model?._id || mg.model.name}
                        className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {mg.model?.name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {mg.products?.length || 0} Products
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openModelModal(mg.model?._id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Box className="h-4 w-4" />
                          View Products
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {modelTotalPages > 1 && (
          <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-xs sm:text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
                Showing{' '}
                {modelGroups.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{' '}
                to {Math.min(currentPage * itemsPerPage, modelGroups.length)} of{' '}
                {modelGroups.length} models
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
                >
                  Previous
                </button>
                <span className="text-xs sm:text-sm text-gray-700 flex-shrink-0">
                  Page {currentPage} of {modelTotalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(modelTotalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === modelTotalPages}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DistributorQRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onProductAssigned={fetchProducts}
      />

      {/* Filter Modal for Mobile */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="all">All Models</option>
                    {models.map((model) => (
                      <option key={model._id} value={model._id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Detail Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModelModal}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-6xl mx-4 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  Model:{' '}
                  {models.find((m) => m._id === activeModelId)?.name ||
                    'Details'}
                </h4>
                <div className="flex items-center gap-4">
                  {modalProducts.length > 0 && (
                    <TableExportButtons
                      exportName={`Model_${models.find((m) => m._id === activeModelId)?.name || 'Products'}_Inventory`}
                      exportData={modalProducts.map(product => ({
                        'Serial Number': product.serialNumber,
                        'Status': product.sold ? 'Sold' : 'Available',
                        'Added Date': new Date(product.createdAt).toLocaleDateString()
                      }))}
                    />
                  )}
                  <button
                    onClick={closeModelModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              {selectedProductGroups.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    Assign to Dealer ({selectedProductGroups.length})
                  </button>
                  <button
                    onClick={() => setShowSaleModal(true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Sell Products ({selectedProductGroups.length})
                  </button>
                </div>
              )}
              <div>
                <div className="space-y-2 mt-5 mb-5 grid grid-cols-2 items-center">
                  <input
                    type="text"
                    placeholder="Start Serial Number"
                    value={startSerialNumber}
                    onChange={(e) => setStartSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="End Serial Number"
                    value={endSerialNumber}
                    onChange={(e) => setEndSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ml-2"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleSelectRange}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Range
                    </button>
                    <button
                      onClick={handleClearRange}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Clear Range
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 px-6 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductGroups([
                              ...new Set([
                                ...selectedProductGroups,
                                ...paginatedModalProducts.filter(
                                  (p) => !p.sold
                                ),
                              ]),
                            ]);
                          } else {
                            setSelectedProductGroups(
                              selectedProductGroups.filter(
                                (sp) =>
                                  !paginatedModalProducts
                                    .map((p) => p._id)
                                    .includes(sp._id)
                              )
                            );
                          }
                        }}
                        checked={
                          paginatedModalProducts.length > 0 &&
                          paginatedModalProducts
                            .filter((p) => !p.sold)
                            .every((p) =>
                              selectedProductGroups.some(
                                (sp) => sp._id === p._id
                              )
                            )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number okoko
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedModalProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProductGroups.some(
                            (p) => p._id === product._id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!product.sold) {
                                setSelectedProductGroups([
                                  ...selectedProductGroups,
                                  product,
                                ]);
                              }
                            } else {
                              setSelectedProductGroups(
                                selectedProductGroups.filter(
                                  (p) => p._id !== product._id
                                )
                              );
                            }
                          }}
                          disabled={product.sold}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.serialNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${product.sold
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {product.sold ? 'Sold' : 'Available'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Modal Pagination */}
            {modalTotalPages > 1 && (
              <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
                  <span>Rows per page:</span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    value={modalItemsPerPage}
                    onChange={(e) => {
                      setModalItemsPerPage(Number(e.target.value));
                      setModalCurrentPage(1);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    Showing{' '}
                    {modalProducts.length > 0
                      ? (modalCurrentPage - 1) * modalItemsPerPage + 1
                      : 0}{' '}
                    to{' '}
                    {Math.min(
                      modalCurrentPage * modalItemsPerPage,
                      modalProducts.length
                    )}{' '}
                    of {modalProducts.length} products
                  </span>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={() =>
                        setModalCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={modalCurrentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 flex-shrink-0">
                      Page {modalCurrentPage} of {modalTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setModalCurrentPage((prev) =>
                          Math.min(modalTotalPages, prev + 1)
                        )
                      }
                      disabled={modalCurrentPage === modalTotalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProductGroups.length > 0 && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          products={selectedProductGroups}
          onSale={handleSale}
        />
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-80 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign {selectedProductGroups.length} Products
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedProductGroups([]);
                  setSelectedDealer('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dealer
              </label>
              <select
                value={selectedDealer}
                onChange={(e) => setSelectedDealer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select a dealer</option>
                {dealers.length > 0 ? (
                  dealers.map((dealer) => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No dealers available</option>
                )}
              </select>
              {dealers.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No dealers found. Create dealers first.
                </p>
              )}
            </div>

            <button
              onClick={handleAssignToDealer}
              disabled={
                selectedProductGroups.length === 0 ||
                !selectedDealer ||
                isAssigning
              }
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {isAssigning ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                'Assign Products'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
