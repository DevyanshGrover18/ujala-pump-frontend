import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import {
  getDealerSales,
  createSale,
} from '../Dealers/services/dealerSalesService';
import { toast } from 'react-hot-toast';
import EditSaleRequestModal from '../Dealers/components/EditSaleRequestModal';
import { Edit, Search, Filter, X, Clock, CheckCircle, Package } from 'lucide-react'; // Added icons
import SellQRScannerModal from '../../global/SellQRScannerModal';
import SaleModal from '../Dealers/components/SaleModal';
import axios from 'axios';
import TableExportButtons from '../../global/TableExportButtons';
import { FilterGroup, FilterItem, FilterSelector } from '../../global/FilterGroup';

const DealerCustomerSales = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- New State for Filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [models, setModels] = useState([]);

  // Fetch dealer sales
  const fetchSales = async () => {
    if (!user || !user.dealer) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [salesData, requestsResponse] = await Promise.all([
        getDealerSales(user.dealer._id),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/customer-change-requests/my-requests`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        ),
      ]);
      const salesDataResp = salesData.sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt));
      setSales(salesDataResp);
      setChangeRequests(requestsResponse.data);

      const uniqueModels = [];
      const modelIds = new Set();
      salesDataResp.forEach((sale) => {
        if (sale.product?.model && !modelIds.has(sale.product.model._id)) {
          uniqueModels.push(sale.product.model);
          modelIds.add(sale.product.model._id);
        }
      });
      setModels(uniqueModels);
    } catch (error) {
      toast.error('Error fetching sales');
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  // Open edit modal
  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  // Handle request submitted
  const handleRequestSubmitted = () => {
    setIsEditModalOpen(false);
    setSelectedSale(null);
    fetchSales(); // Refresh to get updated change requests
  };

  // Get change request status for a sale
  const getChangeRequestStatus = (saleId) => {
    const request = changeRequests.find((req) => req.sale._id === saleId);
    if (!request) return null;
    return request.status; // 'pending', 'approved', 'rejected'
  };

  // Handle product scanned from QR
  const handleProductScanned = (product) => {
    const group = {
      _id: product._id,
      productName: product.productName,
      productsInBox: [product],
    };
    setScannedProduct(group);
    setShowScannerModal(false);
    setShowSaleModal(true);
  };

  // Handle product sale
  const handleSale = async (customerData) => {
    if (!scannedProduct) return;

    try {
      for (const product of scannedProduct.productsInBox) {
        await createSale({
          productId: product._id,
          dealerId: user.dealer._id,
          ...customerData,
        });
      }
      toast.success('Product sold successfully');
      setShowSaleModal(false);
      setScannedProduct(null);
      fetchSales();
    } catch (error) {
      toast.error('Error selling product');
      console.error('Error selling product:', error);
    }
  };

  // Calculate warranty status and remaining time
  const getWarrantyInfo = (sale) => {
    const product = sale.product || {};

    // Prefer assignedWarranty set at distributor assignment time
    const warrantyConfig =
      product.assignedWarranty || product.model?.warranty?.[0];
    if (!warrantyConfig) {
      return {
        status: 'No Warranty Info',
        remaining: 'N/A',
        color: 'bg-gray-100 text-gray-800',
      };
    }

    const saleDate = new Date(sale.soldAt || sale.createdAt);
    const warrantyDuration = warrantyConfig.duration;
    const durationType = warrantyConfig.durationType || 'Months';

    const expiryDate = new Date(saleDate);
    if (durationType === 'Years') {
      expiryDate.setFullYear(expiryDate.getFullYear() + warrantyDuration);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + warrantyDuration);
    }

    const now = new Date();
    const timeRemaining = expiryDate - now;

    if (timeRemaining <= 0) {
      return {
        status: 'Expired',
        remaining: 'Warranty expired',
        color: 'bg-red-100 text-red-800',
      };
    }

    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.floor(daysRemaining / 30);

    let remainingText;
    if (monthsRemaining > 0) {
      remainingText = `${monthsRemaining} months remaining`;
    } else {
      remainingText = `${daysRemaining} days remaining`;
    }

    return {
      status: 'Active',
      remaining: remainingText,
      color:
        daysRemaining > 30
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800',
    };
  };

  // --- New Clear Filters Function ---
  const clearAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setWarrantyFilter('all');
    setRequestStatusFilter('all');
    setModelFilter('all');
    setCurrentPage(1);
  };

  // --- Updated Filtering Logic ---
  const filteredSales = sales.filter((sale) => {
    const changeStatus = getChangeRequestStatus(sale._id);
    const warrantyInfo = getWarrantyInfo(sale);

    // Search Term Filter
    const searchMatch =
      searchTerm === '' ||
      sale.product.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sale.product.serialNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());

    // Date Filter
    const saleDate = new Date(sale.soldAt);
    const startMatch = !startDate || saleDate >= new Date(startDate);
    const endMatch = !endDate || saleDate <= new Date(endDate);

    // Warranty Filter
    const warrantyMatch =
      warrantyFilter === 'all' ||
      warrantyInfo.status.toLowerCase().includes(warrantyFilter);

    // Request Status Filter
    const requestStatusMatch =
      requestStatusFilter === 'all' ||
      (requestStatusFilter === 'none' && !changeStatus) ||
      changeStatus === requestStatusFilter;

    // Model Filter
    const modelMatch = modelFilter === 'all' || sale.product?.model?._id === modelFilter;

    return (
      searchMatch &&
      startMatch &&
      endMatch &&
      warrantyMatch &&
      requestStatusMatch &&
      modelMatch
    );
  });

  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const getStatusBadge = (status) => {
    if (!status) {
      return <span className="text-gray-400 text-xs">-</span>;
    }
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const text = {
      pending: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}
      >
        {text[status]}
      </span>
    );
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header - NOW RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Customer Sales
          </h1>
          <p className="text-sm text-gray-600">
            {filteredSales.length} direct sales to customers found
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <TableExportButtons
            exportName="Dealer_Customer_Sales"
            exportData={filteredSales.map(sale => {
              const warrantyInfo = getWarrantyInfo(sale);
              const changeStatus = getChangeRequestStatus(sale._id);
              return {
                'Model Name': sale?.product?.productName || '-',
                'Serial Number': sale?.product?.serialNumber || '-',
                'Customer Name': sale?.customerName || '-',
                'Customer Phone': sale?.customerPhone || '-',
                'Warranty Status': warrantyInfo?.status || '-',
                'Warranty Remaining': warrantyInfo?.remaining || '-',
                'Sold At': new Date(sale?.soldAt).toLocaleDateString(),
                'Change Status': changeStatus || 'None'
              };
            })}
          />
          <button
            onClick={() => setShowScannerModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            Scan Product to Sell
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* --- New Responsive Filter Bar --- */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          {/* Desktop Filters */}
          <div className="hidden lg:block space-y-4">
            <FilterGroup>
              <FilterItem>
                <div className="flex gap-4 w-full">
                  <div className="relative flex-grow min-w-[200px] w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by product, serial, customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-full sm:w-48 relative flex-shrink-0">
                    <select
                      value={modelFilter}
                      onChange={(e) => {
                        setModelFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none h-full"
                    >
                      <option value="all">All Models</option>
                      {models.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
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
                    title="From Date"
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
                    title="To Date"
                  />
                </div>
              </FilterItem>
              <FilterItem>
                <select
                  value={warrantyFilter}
                  onChange={(e) => setWarrantyFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                  <option value="all">All Warranty</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </FilterItem>
              <FilterItem>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                  <option value="all">All Request Status</option>
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FilterItem>
              <FilterItem>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium h-[42px]"
                >
                  Clear Filters
                </button>
              </FilterItem>
            </FilterGroup>
          </div>

          {/* Mobile Search and Filter Button */}
          <div className="lg:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, serial, customer..."
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
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* --- Responsive List Container --- */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading sales...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">No sales match your criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table (like FactoryOrders) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Warranty Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Warranty Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sold At
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Status</th> */}
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((sale) => {
                    const warrantyInfo = getWarrantyInfo(sale);
                    const changeStatus = getChangeRequestStatus(sale._id);
                    return (
                      <tr key={sale._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {sale?.product?.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sale?.product?.serialNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {sale?.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sale?.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo?.color}`}
                          >
                            {warrantyInfo?.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {warrantyInfo?.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sale?.soldAt).toLocaleDateString()}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(changeStatus)}
                                                </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (like FactoryOrders) */}
            <div className="md:hidden space-y-4 p-4">
              {currentItems.map((sale) => {
                const warrantyInfo = getWarrantyInfo(sale);
                const changeStatus = getChangeRequestStatus(sale._id);
                return (
                  <div
                    key={sale._id}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {sale?.product?.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {sale?.product?.serialNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-900 -mt-1 -mr-1 p-1"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="text-gray-800 font-medium">
                        {sale?.customerName}
                      </p>
                      <p className="text-gray-600">{sale?.customerPhone}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo?.color}`}
                      >
                        {warrantyInfo?.status}
                      </span>
                      {getStatusBadge(changeStatus)}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Sold: {new Date(sale.soldAt).toLocaleDateString()}</p>
                      <p>{warrantyInfo?.remaining}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredSales.length > itemsPerPage && (
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
                Showing {indexOfFirstItem + 1} to{' '}
                {Math.min(indexOfLastItem, filteredSales.length)} of{' '}
                {filteredSales.length} sales
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
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- New Filter Modal for Mobile --- */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 lg:hidden">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Status
                </label>
                <select
                  value={warrantyFilter}
                  onChange={(e) => setWarrantyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Request Status
                </label>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
      {selectedSale && (
        <EditSaleRequestModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          sale={selectedSale}
          onRequestSubmitted={handleRequestSubmitted}
        />
      )}

      <SellQRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onProductScanned={handleProductScanned}
      />

      {scannedProduct && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          group={scannedProduct}
          onSale={handleSale}
        />
      )}
    </div>
  );
};

export default DealerCustomerSales;
