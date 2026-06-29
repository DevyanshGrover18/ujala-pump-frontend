import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Edit, Search, Package, Filter, X } from 'lucide-react';
import SubDealerQRScannerModal from './SubDealerQRScannerModal';
import SaleModal from '../Dealers/components/SaleModal';
import EditSaleRequestModal from '../Dealers/components/EditSaleRequestModal';
import { updateSale } from '../Dealers/services/dealerSalesService';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../global/FilterGroup';
import TableExportButtons from '../../global/TableExportButtons';

export default function SubDealerSales() {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [models, setModels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // New state for filter modal
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user && user.role === 'subdealer') {
      fetchSales();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch sub-dealer sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      const [salesRes, requestsRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/sales/subdealer/${user.subDealer?._id || user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/customer-change-requests/my-requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        ),
      ]);

      const salesData = salesRes.data;
      setSales(salesData);
      setChangeRequests(requestsRes.data);

      // Extract unique models from sales data
      const uniqueModels = [];
      const modelIds = new Set();

      salesData.forEach((sale) => {
        if (sale.product?.model && !modelIds.has(sale.product.model._id)) {
          uniqueModels.push(sale.product.model);
          modelIds.add(sale.product.model._id);
        }
      });

      setModels(uniqueModels);
    } catch (error) {
      console.error('Sales error:', error);
      toast.error(
        'Error fetching sales: ' +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle product scanned from QR
  const handleProductScanned = (product) => {
    const group = {
      _id: product._id,
      productName: product.productName || product.model?.name,
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
      toast.success('Product sold successfully');
      setShowSaleModal(false);
      setScannedProduct(null);
      fetchSales();
    } catch (error) {
      console.error('Sale error:', error);
      toast.error(
        'Error selling product: ' +
        (error.response?.data?.message || error.message)
      );
    }
  };

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
    return request.status;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setModelFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredSales = sales.filter((sale) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const matchesSearch =
      (sale.product?.serialNumber &&
        sale.product.serialNumber
          .toLowerCase()
          .includes(lowerCaseSearchTerm)) ||
      (sale.product?.model?.name &&
        sale.product.model.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (sale.customerName &&
        sale.customerName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (sale.customerPhone &&
        sale.customerPhone.toLowerCase().includes(lowerCaseSearchTerm));

    const matchesModel =
      modelFilter === 'all' || sale.product?.model?._id === modelFilter;

    const saleDate = new Date(sale.soldAt || sale.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const matchesDate =
      (!start || saleDate >= start) && (!end || saleDate <= end);

    return matchesSearch && matchesModel && matchesDate;
  });

  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

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

    // Calculate warranty expiry
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

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Customer Sales
              </h1>
              <p className="text-sm text-gray-600">
                Total Sales: {filteredSales.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <TableExportButtons
                exportName="SubDealer_Customer_Sales"
                exportData={filteredSales.map((sale) => {
                  const warrantyInfo = getWarrantyInfo(sale);
                  const changeStatus = getChangeRequestStatus(sale._id);
                  return {
                    'Model': sale.product?.productName || sale.product?.model?.name || 'N/A',
                    'Serial Number': sale.product?.serialNumber || 'N/A',
                    'Customer Name': sale.customerName,
                    'Customer Phone': sale.customerPhone,
                    'Warranty Status': warrantyInfo.status,
                    'Warranty Remaining': warrantyInfo.remaining,
                    'Sold At': new Date(sale.soldAt || sale.createdAt).toLocaleDateString(),
                    'Status': changeStatus || 'None',
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
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden p-3 sm:p-6 border-b border-gray-200">
          <div className="space-y-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by serial, model, customer..."
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
              <FilterItem>
                <div className="flex gap-4 w-full">
                  <div className="relative flex-grow min-w-[200px] w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by serial, model, customer..."
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
                    title="Start Date"
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

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">
              {sales.length === 0
                ? 'No sales found.'
                : 'No sales match the current filters.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.product?.productName ||
                            sale.product?.model?.name ||
                            'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.product?.serialNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.customerPhone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo.color}`}
                          >
                            {warrantyInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {warrantyInfo.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            sale.soldAt || sale.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {changeStatus ? (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${changeStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : changeStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {changeStatus === 'pending'
                                ? 'Under Review'
                                : changeStatus.charAt(0).toUpperCase() +
                                changeStatus.slice(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
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

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4 p-4">
              {currentItems.map((sale) => {
                const warrantyInfo = getWarrantyInfo(sale);
                const changeStatus = getChangeRequestStatus(sale._id);
                return (
                  <div
                    key={sale._id}
                    className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {sale.product?.productName ||
                            sale.product?.model?.name ||
                            'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {sale.product?.serialNumber || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium text-gray-900">
                          {sale.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">
                          {sale.customerPhone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold At:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(
                            sale.soldAt || sale.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Warranty:</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo.color}`}
                        >
                          {warrantyInfo.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {warrantyInfo.remaining}
                      </p>
                    </div>

                    {changeStatus && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Request Status:
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${changeStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : changeStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {changeStatus === 'pending'
                              ? 'Under Review'
                              : changeStatus.charAt(0).toUpperCase() +
                              changeStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
          </>
        )}
      </div>

      {/* Filter Modal for Mobile */}
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

      {/* Modals */}
      {selectedSale && (
        <EditSaleRequestModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          sale={selectedSale}
          onRequestSubmitted={handleRequestSubmitted}
        />
      )}

      <SubDealerQRScannerModal
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
}
