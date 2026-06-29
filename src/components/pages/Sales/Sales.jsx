import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  X,
  Box,
  QrCode,
  Trash,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SaleFilters } from './components/SaleFilters';
import BulkSaleModal from './components/BulkSaleModal';
import ConfirmationModal from '../../global/ConfirmationModal';
import CustomerInfoModal from './components/CustomerInfoModal';
import AdminAddCustomerModal from './components/AdminAddCustomerModal';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = import.meta.env.VITE_API_URL;

export default function Sales() {
  // --- Main State ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [distributorFilter, setDistributorFilter] = useState('all');
  const [factoryFilter, setFactoryFilter] = useState('all');
  const [serialNumber, setSerialNumber] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [dealerFilter, setDealerFilter] = useState('all');

  // Customer modal state
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Admin Add Customer Modal State
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [selectedUnsoldProduct, setSelectedUnsoldProduct] = useState(null);

  // --- Modal State ---
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);
  const [modalStatusFilter, setModalStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectionRange, setSelectionRange] = useState({ start: '', end: '' });

  const [isBulkSaleOpen, setIsBulkSaleOpen] = useState(false);

  const [distributors, setDistributors] = useState([]);

  const [showFirstConfirmationModal, setShowFirstConfirmationModal] =
    useState(false);
  const [showSecondConfirmationModal, setShowSecondConfirmationModal] =
    useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch Distributors
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/distributors`);
        setDistributors(res.data);
      } catch (err) {
        console.error('Distributor fetch error', err);
      }
    };
    fetchDistributors();
  }, []);

  // --- Fetch Sales Data ---
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (distributorFilter !== 'all')
        params.append('distributor', distributorFilter);
      if (factoryFilter !== 'all') params.append('factory', factoryFilter);
      if (serialNumber) params.append('serialNumber', serialNumber);
      if (modelFilter !== 'all') params.append('model', modelFilter);
      if (dealerFilter !== 'all') params.append('dealer', dealerFilter);

      const response = await axios.get(
        `${API_URL}/api/sales/assigned-products?${params.toString()}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [
    searchTerm,
    dateRange,
    distributorFilter,
    factoryFilter,
    serialNumber,
    modelFilter,
    dealerFilter,
  ]);

  // --- Filtered Products ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        product.model?.name?.toLowerCase().includes(searchLower) ||
        product.serialNumber?.toLowerCase().includes(searchLower) ||
        product.distributor?.name?.toLowerCase().includes(searchLower) ||
        product.dealer?.name?.toLowerCase().includes(searchLower) ||
        product.subDealer?.name?.toLowerCase().includes(searchLower) ||
        product.factory?.name?.toLowerCase().includes(searchLower);

      const matchDate =
        (!dateRange.startDate ||
          new Date(product.assignedToDistributorAt) >=
          new Date(dateRange.startDate)) &&
        (!dateRange.endDate ||
          new Date(product.assignedToDistributorAt) <=
          new Date(new Date(dateRange.endDate).setHours(23, 59, 59, 999)));

      const matchDistributor =
        distributorFilter === 'all' ||
        product.distributor?._id === distributorFilter;
      const matchFactory =
        factoryFilter === 'all' || product.factory?._id === factoryFilter;
      const matchSerialNumber =
        !serialNumber ||
        product.serialNumber
          ?.toLowerCase()
          .includes(serialNumber.toLowerCase());
      const matchModel =
        modelFilter === 'all' || product.model?._id === modelFilter;
      const matchDealer =
        dealerFilter === 'all' || product.dealer?._id === dealerFilter;

      return (
        matchSearch &&
        matchDate &&
        matchDistributor &&
        matchFactory &&
        matchSerialNumber &&
        matchModel &&
        matchDealer
      );
    });
  }, [
    products,
    searchTerm,
    dateRange,
    distributorFilter,
    factoryFilter,
    serialNumber,
    modelFilter,
    dealerFilter,
  ]);

  // --- Group Products by Model ---
  const modelGroups = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((product) => {
      const mid = product.model?._id || 'unknown';
      if (!groups[mid]) {
        groups[mid] = {
          model: product.model || { name: 'Unknown', _id: mid },
          count: 0,
          items: [],
        };
      }
      groups[mid].count += 1;
      groups[mid].items.push(product);
    });
    return Object.values(groups);
  }, [filteredProducts]);

  const totalPages = Math.ceil(modelGroups.length / itemsPerPage) || 1;
  const paginatedModelGroups = useMemo(() => {
    return modelGroups.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [modelGroups, currentPage, itemsPerPage]);

  // --- Modal Logic ---
  const openModelModal = (modelId) => {
    setActiveModelId(modelId);
    setModalCurrentPage(1);
    setIsModelModalOpen(true);
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProductIds = new Set(paginatedModalProducts.map((p) => p._id));
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts(new Set());
    }
  };

  useEffect(() => {
    if (isModelModalOpen) {
      setSelectedProducts(new Set());
      setModalStatusFilter('all');
    }
  }, [isModelModalOpen]);

  const handleRangeSelect = () => {
    const { start, end } = selectionRange;
    if (!start || !end) {
      toast.error('Please enter both a start and end serial number.');
      return;
    }

    if (start.toLowerCase() > end.toLowerCase()) {
      toast.error('Start serial number cannot be after end serial number.');
      return;
    }

    const productsInRange = modalProducts.filter(
      (p) =>
        p.serialNumber.toLowerCase() >= start.toLowerCase() &&
        p.serialNumber.toLowerCase() <= end.toLowerCase()
    );

    if (productsInRange.length === 0) {
      toast.error('No products found in the specified range.');
      return;
    }

    const productsToSelect = new Set(productsInRange.map((p) => p._id));

    setSelectedProducts((prev) => new Set([...prev, ...productsToSelect]));
    toast.success(`Selected ${productsToSelect.size} products.`);
  };

  const handleRangeDeselect = () => {
    const { start, end } = selectionRange;
    if (!start || !end) {
      toast.error(
        'Please enter both a start and end serial number for deselection.'
      );
      return;
    }

    if (start.toLowerCase() > end.toLowerCase()) {
      toast.error('Start serial number cannot be after end serial number.');
      return;
    }

    const productsInRange = modalProducts.filter(
      (p) =>
        p.serialNumber.toLowerCase() >= start.toLowerCase() &&
        p.serialNumber.toLowerCase() <= end.toLowerCase()
    );

    if (productsInRange.length === 0) {
      toast.error('No products found in the specified range to deselect.');
      return;
    }

    const productsToDeselect = new Set(productsInRange.map((p) => p._id));

    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      for (const id of productsToDeselect) {
        newSet.delete(id);
      }
      return newSet;
    });
    toast.success(`Deselected ${productsToDeselect.size} products.`);
  };

  const handleRevertAssignment = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products to revert.');
      return;
    }

    try {
      const productIds = Array.from(selectedProducts);
      const response = await axios.put(
        `${API_URL}/api/distributor/products/revert-assign`,
        { productIds }
      );

      toast.success(response.data.message || 'Products reverted successfully!');

      // Refresh data
      fetchSalesData();

      // Close modal
      setIsModelModalOpen(false);

      // Clear selection
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error reverting products:', error);
      const msg = error.response?.data?.message || 'Failed to revert products.';
      toast.error(msg);
    }
  };

  const modalProducts = useMemo(() => {
    let products = filteredProducts.filter(
      (p) => p.model?._id === activeModelId
    );
    if (modalStatusFilter === 'sold') {
      products = products.filter((p) => !!p.sale?.customerName);
    } else if (modalStatusFilter === 'unsold') {
      products = products.filter((p) => !p.sale?.customerName);
    }
    return products;
  }, [filteredProducts, activeModelId, modalStatusFilter]);

  const modalTotalPages =
    Math.ceil(modalProducts.length / modalItemsPerPage) || 1;
  const paginatedModalProducts = useMemo(() => {
    const start = (modalCurrentPage - 1) * modalItemsPerPage;
    return modalProducts.slice(start, start + modalItemsPerPage);
  }, [modalProducts, modalCurrentPage, modalItemsPerPage]);

  // --- Warranty Logic ---
  const getWarrantyInfo = (product) => {
    if (!product.model?.warranty || !product.distributor) {
      return { status: 'No Info', remaining: 'N/A', color: 'text-gray-500' };
    }

    const distributorState = product.distributor.state?.toLowerCase();
    const distributorDistrict = product.distributor.district?.toLowerCase();
    const warrantyConfig =
      product.model.warranty.find(
        (w) =>
          w.state?.toLowerCase() === distributorState &&
          w.district?.toLowerCase() === distributorDistrict
      ) ||
      product.model.warranty.find(
        (w) => w.state?.toLowerCase() === distributorState
      );

    if (!warrantyConfig)
      return { status: 'No Config', remaining: 'N/A', color: 'text-gray-500' };
    if (!product.sold)
      return {
        status: 'In Stock',
        remaining: 'Starts on Sale',
        color: 'text-orange-500',
      };

    const saleDate = new Date(product.saleDate);
    const expiryDate = new Date(saleDate);
    if (warrantyConfig.durationType === 'Years')
      expiryDate.setFullYear(
        expiryDate.getFullYear() + warrantyConfig.duration
      );
    else expiryDate.setMonth(expiryDate.getMonth() + warrantyConfig.duration);

    const daysRemaining = Math.ceil(
      (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysRemaining <= 0)
      return { status: 'Expired', remaining: '0 days', color: 'text-red-500' };
    return {
      status: 'Active',
      remaining: `${daysRemaining} days`,
      color: 'text-green-500',
    };
  };

  // Handle view customer details
  const handleViewCustomer = (product) => {
    setSelectedSale(product.sale);
    setCustomerModalOpen(true);
  };

  const handleOpenAddCustomer = (product) => {
    setSelectedUnsoldProduct(product);
    setIsAddCustomerModalOpen(true);
  };

  const handleAdminSaleSubmit = async (productId, formData) => {
    try {
      const response = await axios.post(`${API_URL}/api/sales/admin-sale`, {
        productId,
        ...formData
      });
      toast.success(response.data.message || 'Product marked as sold successfully');

      setIsAddCustomerModalOpen(false);
      setSelectedUnsoldProduct(null);
      fetchSalesData(); // Refresh the sales data table
    } catch (error) {
      console.error('Error creating admin sale:', error);
      const msg = error.response?.data?.message || 'Failed to complete sale';
      toast.error(msg);
    }
  };

  const handleDeleteClick = (product) => {
    setOrderToDelete(product);
    setShowFirstConfirmationModal(true);
  };

  const handleConfirmFirstDelete = () => {
    setShowFirstConfirmationModal(false);
    setShowSecondConfirmationModal(true);
  };

  const handleCancelDelete = () => {
    setShowFirstConfirmationModal(false);
    setShowSecondConfirmationModal(false);
    setOrderToDelete(null);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!orderToDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/sales/sale-delete/${orderToDelete._id}`
      );
      toast.success(response.data.message || 'Product deleted permanently');
      fetchSalesData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
    } finally {
      handleCancelDelete();
    }
  };

  return (
    <div className="p-4 lg:p-4 min-h-full">
      {/* --- Dashboard & Filters --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Total Unique Models: {modelGroups.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <TableExportButtons
              exportName="Sales_Dashboard_Models"
              exportData={modelGroups.map(mg => ({
                'Model': mg.model?.name || 'Unknown',
                'Total Products': mg.count || 0
              }))}
            />
            <button
              onClick={() => setIsBulkSaleOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <QrCode className="h-4 w-4" />
              <span>Sale Products</span>
            </button>
          </div>
        </div>
        <SaleFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          distributorFilter={distributorFilter}
          onDistributorFilterChange={setDistributorFilter}
          factoryFilter={factoryFilter}
          onFactoryFilterChange={setFactoryFilter}
          serialNumber={serialNumber}
          onSerialNumberChange={setSerialNumber}
          modelFilter={modelFilter}
          onModelFilterChange={setModelFilter}
          dealerFilter={dealerFilter}
          onDealerFilterChange={setDealerFilter}
          onClearFilters={() => {
            setSearchTerm('');
            setDateRange({ startDate: '', endDate: '' });
            setDistributorFilter('all');
            setFactoryFilter('all');
            setSerialNumber('');
            setModelFilter('all');
            setDealerFilter('all');
          }}
        />
      </div>

      {/* --- Main Table --- */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan="2" className="text-center py-12">
                    <div className="text-gray-500">Loading sales...</div>
                  </td>
                </tr>
              ) : paginatedModelGroups.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-12">
                    <div className="text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      No sales found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedModelGroups.map((group) => (
                  <tr key={group.model._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.model.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModelModal(group.model._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Box className="h-4 w-4 mr-1" />
                        {group.count || 0} Total Products
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination & Rows Per Page --- */}
        <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mt-4">
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm text-gray-700 hidden sm:inline">
              Showing{' '}
              {modelGroups.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{' '}
              to {Math.min(currentPage * itemsPerPage, modelGroups.length)} of{' '}
              {modelGroups.length} models
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700 flex-shrink-0">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal --- */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModelModalOpen(false)}
          ></div>

          <div className="bg-white shadow-lg z-70 w-full h-full flex flex-col overflow-y-auto">
            <div className="p-4 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Model:{' '}
                  {
                    products.find((p) => p.model?._id === activeModelId)?.model
                      ?.name
                  }
                </h3>
                <p className="text-xs text-gray-500">
                  Showing all assigned products for this model
                </p>
              </div>
              <div className="flex items-center gap-4">
                <TableExportButtons
                  exportName={`Model_${products.find((p) => p.model?._id === activeModelId)?.model?.name || 'Sales'}_Products`}
                  pdfOrientation="l"
                  pdfSize="a3"
                  exportData={modalProducts.map((p) => ({
                    'Model': p.model?.name || 'N/A',
                    'Serial Number': p.serialNumber,
                    'Distributor': p.distributor?.name || 'N/A',
                    'Assigned Date': p.assignedToDistributorAt ? new Date(p.assignedToDistributorAt).toLocaleDateString() : 'N/A',
                    'Dealer': p.dealer?.name || 'NA',
                    'Sub Dealer': p.subDealer?.name || 'NA',
                    'Factory': p.factory?.name || 'N/A',
                    'Warranty Status': getWarrantyInfo(p).status,
                    'Warranty Balance': getWarrantyInfo(p).remaining,
                    'Customer Name': p.sale?.customerName || 'N/A',
                    'Customer Phone': p.sale?.customerPhone || 'N/A',
                    'Customer Address': p.sale?.customerAddress || 'N/A',
                    'Alt Phone': p.sale?.alternateMobileNumber || 'N/A',
                    'Plumber Name': p.sale?.plumberName || 'N/A',
                    'Plumber Phone': p.sale?.plumberMobileNumber || 'N/A',
                    'Sale Date': p.sale?.saleDate ? new Date(p.sale.saleDate).toLocaleDateString() : 'N/A',
                  }))}
                />
                <button
                  onClick={() => setIsModelModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* --- Range Selection --- */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Select by Serial Range:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Start Serial"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent w-32"
                    value={selectionRange.start}
                    onChange={(e) =>
                      setSelectionRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="text"
                    placeholder="End Serial"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent w-32"
                    value={selectionRange.end}
                    onChange={(e) =>
                      setSelectionRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                  />
                </div>
                <button
                  onClick={handleRangeSelect}
                  className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400"
                  disabled={!selectionRange.start || !selectionRange.end}
                >
                  Select Range
                </button>
                <button
                  onClick={handleRangeDeselect}
                  className="px-4 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:bg-gray-400"
                  disabled={!selectionRange.start || !selectionRange.end}
                >
                  Deselect Range
                </button>
              </div>
            </div>

            {/* --- Bulk Actions --- */}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleRevertAssignment}
                disabled={selectedProducts.size === 0}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Transfer back to Inventory ({selectedProducts.size})
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status </span>
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setModalStatusFilter('all')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modalStatusFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setModalStatusFilter('sold')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modalStatusFilter === 'sold'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Sold
                  </button>
                  <button
                    onClick={() => setModalStatusFilter('unsold')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${modalStatusFilter === 'unsold'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Unsold
                  </button>
                </div>
              </div>
            </div>

            {modalProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No products assigned to distributors found.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label="Select all products"
                            onChange={handleSelectAll}
                            checked={
                              paginatedModalProducts.length > 0 &&
                              selectedProducts.size ===
                              paginatedModalProducts.length
                            }
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Model
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Serial Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Distributor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Assigned Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Dealer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sub Dealer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Factory
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Warranty Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Warranty Balance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sold to
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedModalProducts.map((product) => {
                        const warrantyInfo = getWarrantyInfo(product);
                        return (
                          <tr
                            key={product._id}
                            className={`hover:bg-gray-50 ${selectedProducts.has(product._id)
                              ? 'bg-blue-50'
                              : ''
                              }`}
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-label={`Select product ${product.serialNumber}`}
                                checked={selectedProducts.has(product._id)}
                                onChange={() => handleProductSelect(product._id)}
                              />
                            </td>
                            <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                              {product.model?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.serialNumber}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.distributor?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.assignedToDistributorAt
                                ? new Date(
                                  product.assignedToDistributorAt
                                ).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.dealer?.name || 'NA'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.subDealer?.name || 'NA'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.factory?.name || 'N/A'}
                            </td>
                            <td
                              className={`px-4 py-4 text-sm font-medium ${warrantyInfo.color}`}
                            >
                              {warrantyInfo.status}
                            </td>
                            <td
                              className={`px-4 py-4 text-sm ${warrantyInfo.color}`}
                            >
                              {warrantyInfo.remaining}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {product.sale?.customerName ? (
                                <button
                                  onClick={() => handleViewCustomer(product)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                >
                                  View Details
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenAddCustomer(product)}
                                  className="px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition text-xs whitespace-nowrap whitespace-pre-wrap"
                                >
                                  Mark Sold
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* --- Modal Pagination & Rows Per Page --- */}
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
                        <option value={5}>5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
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
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
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
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Add Customer Modal --- */}
      {isAddCustomerModalOpen && selectedUnsoldProduct && (
        <AdminAddCustomerModal
          isOpen={isAddCustomerModalOpen}
          product={selectedUnsoldProduct}
          onClose={() => {
            setIsAddCustomerModalOpen(false);
            setSelectedUnsoldProduct(null);
          }}
          onSubmit={handleAdminSaleSubmit}
        />
      )}

      {/* --- Sale Products Modal --- */}
      <BulkSaleModal
        isOpen={isBulkSaleOpen}
        onClose={() => setIsBulkSaleOpen(false)}
        distributors={distributors}
        fetchSalesData={fetchSalesData}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showFirstConfirmationModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmFirstDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this order? This action will also delete all associated order items."
        confirmButtonText="Continue to Permanent Delete"
        details={
          orderToDelete
            ? {
              'Serial Number': orderToDelete.serialNumber,
              Factory: orderToDelete.factory?.name,
            }
            : null
        }
        className="z-80"
      />

      <ConfirmationModal
        isOpen={showSecondConfirmationModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmPermanentDelete}
        title="Permanent Deletion Warning"
        message="This is a permanent deletion. All order data and associated items will be irrevocably removed from the system. Are you absolutely sure?"
        confirmButtonText="Delete Permanently"
        confirmButtonClass="bg-red-700 hover:bg-red-800"
        details={
          orderToDelete
            ? {
              'Serial Number': orderToDelete.serialNumber,
              Factory: orderToDelete.factory?.name,
            }
            : null
        }
        className="z-80"
      />

      {/* Customer Info Modal */}
      <CustomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        sale={selectedSale}
        onRequestSubmitted={fetchSalesData}
      />
    </div>
  );
}
