import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Search,
  Package,
  Building,
  Filter,
  X,
  ChevronDown,
  Box,
} from 'lucide-react';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../global/FilterGroup';
import SaleModal from '../Dealers/components/SaleModalTwo';
import TableExportButtons from '../../global/TableExportButtons';

export default function SubDealerProducts() {
  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [distributorFilter, setDistributorFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [models, setModels] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Modal state for individual products
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);

  useEffect(() => {
    if (user && user.role === 'subdealer') {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dealer-subdealer-products/subdealer/my-products`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const productsData = productsRes.data;
      setProducts(
        productsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );

      const uniqueModels = [];
      const uniqueDistributors = [];
      const modelIds = new Set();
      const distributorIds = new Set();

      productsData.forEach((assignment) => {
        if (
          assignment.product?.model &&
          !modelIds.has(assignment.product.model._id)
        ) {
          uniqueModels.push(assignment.product.model);
          modelIds.add(assignment.product.model._id);
        }
        if (
          assignment.distributor &&
          !distributorIds.has(assignment.dealer._id)
        ) {
          uniqueDistributors.push(assignment.dealer);
          distributorIds.add(assignment.dealer._id);
        }
      });

      setModels(uniqueModels.sort((a, b) => a.name.localeCompare(b.name)));
      setDistributors(
        uniqueDistributors.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error('Products error:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const getProductStatus = (product) => {
    if (product.sold)
      return { label: 'Sold', color: 'bg-red-100 text-red-800' };
    return { label: 'Available', color: 'bg-green-100 text-green-800' };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setModelFilter('all');
    setDistributorFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // const handleProductSelect = (product) => {
  //     console.log("product - ",product);
  //     const productId = product._id;
  //     if (selectedProducts.some(p => p._id === productId)) {
  //         setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  //         console.log("selectedProducts - ",selectedProducts);

  //     } else {
  //         setSelectedProducts([...selectedProducts, product]);
  //     }
  // };

  const handleProductSelect = (product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.some((p) => p._id === product._id)) {
        return prevSelected.filter((p) => p._id !== product._id);
      } else {
        return [...prevSelected, product];
      }
    });
  };

  console.log(selectedProducts);

  const handleSale = async (customerData) => {
    if (selectedProducts.length === 0) return;

    try {
      for (const product of selectedProducts) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/sales/subdealer-sale`,
          {
            productId: product._id,
            subDealerId: user.subDealer?._id || user._id,
            ...customerData,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      toast.success('Products sold successfully');
      setShowSaleModal(false);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error(
        'Error selling products: ' +
        (error.response?.data?.message || error.message)
      );
    }
  };

  // Filter products - only available (not sold)
  const filteredProducts = useMemo(() => {
    return products
      .filter((assignment) => {
        if (!assignment.product || assignment.product.sold) return false;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const matchesSearch =
          (assignment.product.serialNumber &&
            assignment.product.serialNumber
              .toLowerCase()
              .includes(lowerCaseSearchTerm)) ||
          (assignment.product.model?.name &&
            assignment.product.model.name
              .toLowerCase()
              .includes(lowerCaseSearchTerm)) ||
          (assignment.distributor?.name &&
            assignment.distributor.name
              .toLowerCase()
              .includes(lowerCaseSearchTerm));

        const matchesModel =
          modelFilter === 'all' ||
          assignment.product.model?._id === modelFilter;
        const matchesDistributor =
          distributorFilter === 'all' ||
          assignment.dealer?._id === distributorFilter;

        const assignedDate = new Date(assignment.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        const matchesDate =
          (!start || assignedDate >= start) && (!end || assignedDate <= end);

        return (
          matchesSearch && matchesModel && matchesDistributor && matchesDate
        );
      })
      .sort(
        (a, b) =>
          getSerialCounter(b.product.serialNumber) -
          getSerialCounter(a.product.serialNumber)
      );
  }, [
    products,
    searchTerm,
    modelFilter,
    distributorFilter,
    startDate,
    endDate,
  ]);

  // Group products by model
  const modelGroups = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((assignment) => {
      const modelId = assignment.product.model?._id;
      const modelName = assignment.product.model?.name || 'Unknown';
      if (!groups[modelId]) {
        groups[modelId] = {
          model: assignment.product.model,
          assignments: [],
        };
      }
      groups[modelId].assignments.push(assignment);
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
  const modalAssignments = useMemo(() => {
    const group = modelGroups.find((g) => g.model._id === activeModelId);
    return group
      ? [...group.assignments].sort(
        (a, b) =>
          getSerialCounter(b.product.serialNumber) -
          getSerialCounter(a.product.serialNumber)
      )
      : [];
  }, [modelGroups, activeModelId]);

  const modalTotalPages = Math.ceil(
    modalAssignments.length / modalItemsPerPage
  );
  const modalIndexOfLastItem = modalCurrentPage * modalItemsPerPage;
  const modalIndexOfFirstItem = modalIndexOfLastItem - modalItemsPerPage;
  const paginatedModalAssignments = modalAssignments.slice(
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

  const activeModel = modelGroups.find(
    (g) => g.model._id === activeModelId
  )?.model;

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Available Inventory
              </h1>
              <p className="text-sm text-gray-600">
                Available Models: {modelGroups.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <TableExportButtons
                exportName="SubDealer_Inventory_Models"
                exportData={modelGroups.map(mg => ({
                  'Model Name': mg.model?.name || 'Unknown',
                  'Products Count': mg.assignments?.length || 0
                }))}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden p-3 sm:p-6 border-b border-gray-200">
          <div className="space-y-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by serial, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
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
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <div className="space-y-4">
            <FilterGroup>
              <FilterItem className="flex-grow">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by serial, model, distributor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  />
                </div>
              </FilterItem>
              <FilterItem>
                <FilterSelector
                  value={modelFilter}
                  onChange={setModelFilter}
                  options={models.map((m) => ({ _id: m._id, name: m.name }))}
                  placeholder="All Models"
                  icon={Package}
                />
              </FilterItem>
              <FilterItem>
                <FilterSelector
                  value={distributorFilter}
                  onChange={setDistributorFilter}
                  options={distributors.map((d) => ({
                    _id: d._id,
                    name: d.name,
                  }))}
                  placeholder="All Dealers"
                  icon={Building}
                />
              </FilterItem>
            </FilterGroup>

            <FilterGroup>
              <FilterItem>
                <div className="relative w-full sm:w-48">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    title="Start Date"
                    placeholder="Start Date"
                  />
                </div>
              </FilterItem>
              <FilterItem>
                <div className="relative w-full sm:w-48">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    title="End Date"
                  />
                </div>
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
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : modelGroups.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">
              {products.length === 0
                ? 'No products assigned to you'
                : 'No products match the current filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedModelGroups.map((group) => (
                    <tr
                      key={group.model._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.model.name}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {group.assignments.length} Total Products
                                            </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openModelModal(group.model._id)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-gray-200 border p-2 font-medium flex"
                        >
                          <Box className="w-4 h-4 mr-2" />
                          {group.assignments.length} Products
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {paginatedModelGroups.map((group) => (
                <div
                  key={group.model._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {group.model.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.assignments.length} Total Products
                      </p>
                    </div>
                    <button
                      onClick={() => openModelModal(group.model._id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                    <option value="75">75</option>
                    <option value="100">100</option>
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
          </>
        )}
      </div>

      {/* Individual Products Modal */}
      {isModelModalOpen && activeModel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {activeModel.name} - Individual Products (
                {modalAssignments.length})
              </h2>
              <div className="flex items-center gap-2">
                <TableExportButtons
                  exportName={`SubDealer_Products_${activeModel?.name}`}
                  exportData={modalAssignments.map(assignment => {
                    const status = getProductStatus(assignment.product);
                    return {
                      'Serial Number': assignment.product.serialNumber,
                      'Dealer': assignment.dealer?.name || 'N/A',
                      'Status': status.label,
                      'Added Date': new Date(assignment.createdAt).toLocaleDateString()
                    };
                  })}
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
              <button
                onClick={() => setShowSaleModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto ml-5 mt-5"
              >
                Sell Selected ({selectedProducts.length})
              </button>
            )}

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {paginatedModalAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dealer
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
                      {paginatedModalAssignments.map((assignment) => {
                        const status = getProductStatus(assignment.product);
                        return (
                          <tr key={assignment._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedProducts.some(
                                  (p) => p._id === assignment.product._id
                                )}
                                onChange={() =>
                                  handleProductSelect(assignment.product)
                                }
                                disabled={assignment.product.sold}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {assignment.product.serialNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {assignment.dealer?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(
                                assignment.createdAt
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Pagination */}
            {modalTotalPages >= 1 && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                    <option value="75">75</option>
                    <option value="100">100</option>
                  </select>
                </div>
                <span className="text-sm text-gray-700">
                  Showing {modalIndexOfFirstItem + 1} to{' '}
                  {Math.min(modalIndexOfLastItem, modalAssignments.length)} of{' '}
                  {modalAssignments.length}
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
                  Distributor
                </label>
                <select
                  value={distributorFilter}
                  onChange={(e) => setDistributorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Distributors</option>
                  {distributors.map((distributor) => (
                    <option key={distributor._id} value={distributor._id}>
                      {distributor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
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

      {/* Sale Modal */}
      {selectedProducts.length > 0 && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          products={selectedProducts}
          onSale={handleSale}
        />
      )}
    </div>
  );
}
