import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Search, Filter, ChevronDown, Box } from 'lucide-react';
import DealerQRScannerModal from '../../global/DealerQRScannerModal';
import SaleModal from '../Dealers/components/SaleModalTwo';
import { createSale } from '../Dealers/services/dealerSalesService';
import { ProductFilters } from '../Distributors/components/ProductFilters';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer`;
const API_URL_1 = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer-inventory`;

export default function DealerProducts() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [subDealers, setSubDealers] = useState([]);
  const [selectedSubDealer, setSelectedSubDealer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modelFilter, setModelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [models, setModels] = useState([]);

  // Modal state for individual products
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage] = useState(10);

  // Serial number range states
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  const fetchDealerProducts = async () => {
    if (!user || !user.dealer) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL_1}/${user.dealer._id}/products`
      );
      setProducts(response.data);
    } catch (error) {
      toast.error('Error fetching dealer products');
      console.error('Error fetching dealer products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.dealer) {
      fetchDealerProducts();
      fetchSubDealers();
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueModels = products.reduce((acc, item) => {
        const model = item.product.model;
        if (model && !acc.find((m) => m._id === model._id)) {
          acc.push(model);
        }
        return acc;
      }, []);
      setModels(uniqueModels.sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [products]);

  const fetchSubDealers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dealer/my-sub-dealers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSubDealers(response.data);
    } catch (error) {
      console.error('Error fetching sub-dealers:', error);
      toast.error('Error fetching sub-dealers');
    }
  };

  const handleProductSelect = (product) => {
    const productId = product._id;
    if (selectedProducts.some((p) => p._id === productId)) {
      setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
    } else {
      if (!product.sold && !product.assignedToSubDealer) {
        setSelectedProducts([...selectedProducts, product]);
      } else {
        toast.error('This product is not available for selection.');
      }
    }
  };

  const getProductsToAssign = () => {
    return selectedProducts.filter(
      (item) => !item.sold && !item.assignedToSubDealer
    );
  };

  const getProductsToSell = () => {
    return selectedProducts.filter(
      (item) => !item.sold && !item.assignedToSubDealer
    );
  };

  const handleAssignToSubDealer = async () => {
    if (!selectedSubDealer) {
      toast.error('Please select a sub-dealer');
      return;
    }

    const productsToAssign = getProductsToAssign();
    if (productsToAssign.length === 0) {
      toast.error('No available products selected for assignment.');
      return;
    }

    try {
      for (const product of productsToAssign) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/dealer-subdealer-products/dealer/assign-to-subdealer`,
          {
            subDealerId: selectedSubDealer,
            productId: product._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      toast.success('Products assigned to sub-dealer successfully');
      setShowAssignModal(false);
      setSelectedProducts([]);
      setSelectedSubDealer('');
      fetchDealerProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning products');
    }
  };

  const handleSale = async (customerData) => {
    const productsToSell = getProductsToSell();
    if (productsToSell.length === 0) {
      toast.error('No available products selected for sale.');
      return;
    }

    try {
      for (const product of productsToSell) {
        await createSale({
          productId: product._id,
          dealerId: user.dealer._id,
          ...customerData,
        });
      }
      toast.success('Products sold successfully');
      setShowSaleModal(false);
      setSelectedProducts([]);
      fetchDealerProducts();
    } catch (error) {
      toast.error('Error selling products');
      console.error('Error selling products:', error);
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

    const productsInRange = modalProducts.filter((product) => {
      const productCounter = getSerialCounter(product.serialNumber);
      return (
        productCounter >= startCounter &&
        productCounter <= endCounter &&
        !product.sold &&
        !product.assignedToSubDealer
      );
    });

    if (productsInRange.length === 0) {
      toast.error('No available products found in the specified range.');
      return;
    }

    const newSelection = [...selectedProducts];
    productsInRange.forEach((product) => {
      if (!newSelection.some((selected) => selected._id === product._id)) {
        newSelection.push(product);
      }
    });

    setSelectedProducts(newSelection);
    toast.success(`Selected ${productsInRange.length} products in range`);
  };

  const handleClearRange = () => {
    setStartSerialNumber('');
    setEndSerialNumber('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setModelFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Filter and group products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'sold') return item.product.sold;
        if (statusFilter === 'available') return !item.product.sold;
        return true;
      })
      .filter((item) => {
        if (modelFilter === 'all') return true;
        return item.product.model?._id === modelFilter;
      })
      .filter((item) => {
        return (
          searchTerm === '' ||
          item.product.serialNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.product.model?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      })
      .sort(
        (a, b) =>
          getSerialCounter(b.product.serialNumber) -
          getSerialCounter(a.product.serialNumber)
      );
  }, [products, statusFilter, modelFilter, searchTerm]);

  // Group products by model
  const modelGroups = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((item) => {
      const modelId = item.product.model?._id;
      const modelName = item.product.model?.name || 'Unknown';
      if (!groups[modelId]) {
        groups[modelId] = {
          model: item.product.model,
          products: [],
        };
      }
      groups[modelId].products.push(item.product);
    });
    return Object.values(groups);
  }, [filteredProducts]);

  // Pagination for model groups
  const indexOfLastModelGroup = currentPage * itemsPerPage;
  const indexOfFirstModelGroup = indexOfLastModelGroup - itemsPerPage;
  const paginatedModelGroups = modelGroups.slice(
    indexOfFirstModelGroup,
    indexOfLastModelGroup
  );
  const totalModelPages = Math.ceil(modelGroups.length / itemsPerPage);

  // Modal pagination for individual products
  const modalProducts = useMemo(() => {
    const group = modelGroups.find((g) => g.model._id === activeModelId);
    return group ? group.products : [];
  }, [modelGroups, activeModelId]);

  const modalTotalPages = Math.ceil(modalProducts.length / modalItemsPerPage);
  const modalIndexOfLastItem = modalCurrentPage * modalItemsPerPage;
  const modalIndexOfFirstItem = modalIndexOfLastItem - modalItemsPerPage;
  const paginatedModalProducts = modalProducts.slice(
    modalIndexOfFirstItem,
    modalIndexOfLastItem
  );

  const openModelModal = (modelId) => {
    setActiveModelId(modelId);
    setIsModelModalOpen(true);
    setModalCurrentPage(1);
  };

  const closeModelModal = () => {
    setIsModelModalOpen(false);
    setActiveModelId(null);
    setModalCurrentPage(1);
  };

  const productsToAssignCount = getProductsToAssign().length;
  const productsToSellCount = getProductsToSell().length;

  const activeModel = modelGroups.find(
    (g) => g.model._id === activeModelId
  )?.model;

  const clearFilters = () => {
    setSearchTerm('');
    setModelFilter('all');
    handleClearRange();
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

            <div className="flex items-center gap-2">
              <TableExportButtons
                exportName="Dealer_Inventory_Models"
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
            modelFilter={modelFilter}
            onModelFilterChange={setModelFilter}
            startSerialNumber={startSerialNumber}
            onStartSerialNumberChange={setStartSerialNumber}
            endSerialNumber={endSerialNumber}
            onEndSerialNumberChange={setEndSerialNumber}
            onSelectRange={handleSelectRange}
            onClearRange={handleClearRange}
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
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="p-4">
              {paginatedModelGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found matching your filters
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
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
                        {paginatedModelGroups.map((group) => (
                          <tr
                            key={group.model._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {group?.model.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => openModelModal(group.model._id)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                              >
                                <Box className="w-4 h-4 mr-2"></Box>
                                {group.products.length} Products
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {paginatedModelGroups.map((group) => (
                      <div
                        key={group.model._id}
                        className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {group.model.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {group.products.length} Total Products
                            </p>
                          </div>
                          <button
                            onClick={() => openModelModal(group.model._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ChevronDown className="h-4 w-4" />
                            View Products
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {modelGroups.length > itemsPerPage && (
          <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm text-gray-700 hidden sm:inline">
                Showing {indexOfFirstModelGroup + 1} to{' '}
                {Math.min(indexOfLastModelGroup, modelGroups.length)} of{' '}
                {modelGroups.length} models
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 flex-shrink-0">
                  Page {currentPage} of {totalModelPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalModelPages, prev + 1)
                    )
                  }
                  disabled={currentPage === totalModelPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Individual Products Modal */}
      {isModelModalOpen && activeModel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {activeModel.name} - Individual Products (
                  {modalProducts.length})
                </h2>
                <div className="flex items-center gap-2">
                  <TableExportButtons
                    exportName={`Dealer_Inventory_Products_${activeModel.name}`}
                    exportData={modalProducts.map(p => ({
                      'Serial Number': p.serialNumber,
                      'Status': p.sold ? 'Sold' : (p.assignedToSubDealer ? 'Assigned' : 'Available'),
                      'Added Date': new Date(p.createdAt).toLocaleDateString()
                    }))}
                  />
                  <button
                    onClick={closeModelModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    Assign to Sub-Dealer ({selectedProducts.length})
                  </button>
                  <button
                    onClick={() => setShowSaleModal(true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Sell Products ({selectedProducts.length})
                  </button>
                </div>
              )}
              <div className="space-y-2 mt-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <div className="col-span-full flex gap-2">
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

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {paginatedModalProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([
                                  ...new Set([
                                    ...selectedProducts,
                                    ...paginatedModalProducts.filter(
                                      (p) => !p.sold && !p.assignedToSubDealer
                                    ),
                                  ]),
                                ]);
                              } else {
                                setSelectedProducts(
                                  selectedProducts.filter(
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
                                .filter(
                                  (p) => !p.sold && !p.assignedToSubDealer
                                )
                                .every((p) =>
                                  selectedProducts.some(
                                    (sp) => sp._id === p._id
                                  )
                                )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
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
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedProducts.some(
                                (p) => p._id === product._id
                              )}
                              onChange={() => handleProductSelect(product)}
                              disabled={
                                product.sold || product.assignedToSubDealer
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {product.serialNumber}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.sold ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Sold
                              </span>
                            ) : product.assignedToSubDealer ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Assigned
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Pagination */}
            {modalProducts.length > modalItemsPerPage && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="text-sm text-gray-700">
                  Showing {modalIndexOfFirstItem + 1} to{' '}
                  {Math.min(modalIndexOfLastItem, modalProducts.length)} of{' '}
                  {modalProducts.length}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setModalCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={modalCurrentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {modalCurrentPage} of {modalTotalPages}
                  </span>
                  <button
                    onClick={() =>
                      setModalCurrentPage((prev) =>
                        Math.min(modalTotalPages, prev + 1)
                      )
                    }
                    disabled={modalCurrentPage === modalTotalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal (Mobile) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
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
                <select
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Models</option>
                  {models.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={clearAllFilters}
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

      {/* Other Modals */}
      <DealerQRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onProductAssigned={fetchDealerProducts}
      />
      {selectedProducts.length > 0 && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          products={selectedProducts}
          onSale={handleSale}
        />
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign {productsToAssignCount} Products
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedProducts([]);
                  setSelectedSubDealer('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sub-Dealer
              </label>
              <select
                value={selectedSubDealer}
                onChange={(e) => setSelectedSubDealer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select a sub-dealer</option>
                {subDealers.length > 0 ? (
                  subDealers.map((subDealer) => (
                    <option key={subDealer._id} value={subDealer._id}>
                      {subDealer.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No sub-dealers available</option>
                )}
              </select>
              {subDealers.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No sub-dealers found. Create sub-dealers first.
                </p>
              )}
            </div>
            <button
              onClick={handleAssignToSubDealer}
              disabled={productsToAssignCount === 0 || !selectedSubDealer}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              Assign Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
