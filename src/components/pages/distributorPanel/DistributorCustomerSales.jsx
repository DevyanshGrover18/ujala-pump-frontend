import {
  ShoppingCart,
  QrCode,
  User,
  Phone,
  Calendar,
  Edit,
  Search,
  Package,
} from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { distributorSalesService } from '../../../services/distributorSalesService';
import { toast } from 'react-hot-toast';
import SellQRScannerModal from '../../global/SellQRScannerModal';
import SaleModal from '../Dealers/components/SaleModal';
import TableExportButtons from '../../global/TableExportButtons';
import EditSaleRequestModal from '../Dealers/components/EditSaleRequestModal';
import { createSale, updateSale } from '../Dealers/services/dealerSalesService';
import axios from 'axios';

export default function DistributorCustomerSales() {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [models, setModels] = useState([]);

  const fetchSales = async () => {
    if (!user || !user.distributor) {
      setLoading(false);
      return;
    }
    try {
      const [salesResponse, requestsResponse] = await Promise.all([
        distributorSalesService.getCustomerSales(user.distributor._id),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/customer-change-requests/my-requests`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        ),
      ]);
      const salesData = salesResponse.data;
      setSales(salesData);
      setChangeRequests(requestsResponse.data);

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
      toast.error('Error fetching customer sales');
      console.error('Error fetching customer sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  // Handle product scanned from QR
  const handleProductScanned = (product) => {
    const group = {
      _id: product._id,
      productName: product.productName,
      productsInBox: [product],
    };
    console.log('group - ', group);

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
          distributorId: user.distributor._id,
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

  // Filter sales based on search term
  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = (
      sale.product?.model?.name?.toLowerCase().includes(searchLower) ||
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.plumberName?.toLowerCase().includes(searchLower) ||
      sale.product?.serialNumber?.toLowerCase().includes(searchLower)
    );
    const modelMatch = modelFilter === 'all' || sale.product?.model?._id === modelFilter;
    return searchMatch && modelMatch;
  });

  // Apply pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <div className="p-2 sm:p-4 lg:p-6 min-h-full">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
          Customer Sales
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Sell products directly to customers.
        </p>
        <button
          onClick={() => setShowScannerModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          <QrCode className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden sm:inline">Scan Product to Sell</span>
          <span className="sm:hidden">Scan to Sell</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Search Field */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by model, customer, plumber, or serial..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm uppercase"
                />
              </div>
              <div className="w-full sm:w-48 relative flex-shrink-0">
                <select
                  value={modelFilter}
                  onChange={(e) => {
                    setModelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
                >
                  <option value="all">All Models</option>
                  {models.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TableExportButtons
                exportName="Customer_Sales"
                exportData={filteredSales.map(sale => {
                  const warrantyInfo = getWarrantyInfo(sale);
                  return {
                    'Model Name': sale?.product?.productName || '-',
                    'Serial Number': sale?.product?.serialNumber || '-',
                    'Customer Name': sale?.customerName || '-',
                    'Customer Phone': sale?.customerPhone || '-',
                    'Warranty Status': warrantyInfo?.status || '-',
                    'Warranty Remaining': warrantyInfo?.remaining || '-',
                    'Sold At': new Date(sale?.soldAt).toLocaleDateString()
                  };
                })}
              />
            </div>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredSales.length} of {sales.length} sales
            </p>
          )}
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-500">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'No sales match your search' : 'No sales found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Get started by selling a product.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Phone
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty Status
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty Remaining
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold At
                    </th>
                    {/* <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th> */}
                    <th className="relative px-3 lg:px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((sale) => {
                    const warrantyInfo = getWarrantyInfo(sale);
                    const changeStatus = getChangeRequestStatus(sale._id);
                    return (
                      <tr
                        key={sale._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale?.product?.productName}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale?.product?.serialNumber}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {sale?.customerName}
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {sale?.customerPhone}
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo?.color}`}
                          >
                            {warrantyInfo?.status}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {warrantyInfo?.remaining}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(sale?.soldAt).toLocaleDateString()}
                          </div>
                        </td>
                        {/* <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                                            {changeStatus ? (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    changeStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    changeStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {changeStatus === 'pending' ? 'Under Review' : changeStatus.charAt(0).toUpperCase() + changeStatus.slice(1)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td> */}
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

            {/* Mobile Cards */}
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
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {sale?.product?.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          SN: {sale?.product?.serialNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {sale?.customerName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {sale?.customerPhone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(sale?.soldAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${warrantyInfo?.color}`}
                      >
                        {warrantyInfo?.status}
                      </span>
                      {changeStatus && (
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
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Warranty: {warrantyInfo.remaining}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredSales.length > 0 && (
              <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
                  <span>Rows per page:</span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs sm:text-sm"
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
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700 flex-shrink-0">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
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
}
