import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Search, Download, Eye, QrCode } from 'lucide-react';
import ErrorBoundary from '../../global/ErrorBoundary';
import BulkDispatchModal from './components/BulkDispatchModal';
import ViewSaleModal from './components/ViewSaleModal';
import { generateSerialNumberRanges } from './utils';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/factories`;

function FactorySales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatchedOrders, setDispatchedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showBulkDispatch, setShowBulkDispatch] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const handleViewDetails = (saleData) => {
    setSelectedSale(saleData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (user && user.factory) {
      fetchDispatchedOrders();
    }
  }, [user]);

  const fetchDispatchedOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/${user.factory._id}/sales`);
      setDispatchedOrders(data);
    } catch (error) {
      toast.error('Error fetching sales data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (boxKey, download = false) => {
    const url = `${import.meta.env.VITE_API_URL}/api/pdf/stickers/${boxKey}${download ? '?download=true' : ''}`;
    if (download) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `stickers-${boxKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
  };

  // Filter orders based on search term
  const filteredOrders = dispatchedOrders.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group filtered orders by orderId
  const groupedOrders = Object.entries(
    filteredOrders.reduce((groups, item) => {
      const orderId = item.orderId;
      if (!groups[orderId]) {
        groups[orderId] = {
          orderId: orderId,
          category: item.category,
          model: item.model,
          orderType: item.orderType,
          dispatchedDate: item.dispatchedAt,
          completedDate: item.completedAt,
          items: [],
        };
      }
      groups[orderId].items.push(item);
      return groups;
    }, {})
  ).sort(
    ([, a], [, b]) => new Date(b.dispatchedDate) - new Date(a.dispatchedDate)
  );

  // Pagination
  const totalItems = groupedOrders.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = groupedOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Sales
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track all completed orders and their details
        </p>
      </div>

      <BulkDispatchModal
        isOpen={showBulkDispatch}
        onClose={() => setShowBulkDispatch(false)}
        fetchSalesData={fetchDispatchedOrders}
        currentFactoryId={user?.factory?._id}
      />

      <ViewSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        saleData={selectedSale}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Dispatched Orders
              </h2>
              <p className="text-sm text-gray-600">
                Total {dispatchedOrders.length} dispatched items
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowBulkDispatch(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Bulk Dispatch
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading sales data...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">
              {dispatchedOrders.length === 0
                ? 'No dispatched orders found'
                : 'No sales match your search criteria'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Date
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispatched Date
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map(([orderId, orderData]) => (
                    <tr key={orderId} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {orderData.orderId}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {orderData.model?.name || 'N/A'}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {generateSerialNumberRanges(orderData.items)}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {orderData.completedDate
                          ? new Date(
                              orderData.completedDate
                            ).toLocaleDateString('en-GB')
                          : '-'}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {orderData.dispatchedDate
                          ? new Date(
                              orderData.dispatchedDate
                            ).toLocaleDateString('en-GB')
                          : '-'}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(orderData)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedOrders.map(([orderId, orderData]) => (
                <div
                  key={orderId}
                  className="bg-gray-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-blue-600">
                        {orderData.orderId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {orderData.model?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Serial Numbers: </span>
                      <span className="text-gray-900 font-medium">
                        {generateSerialNumberRanges(orderData.items)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Completed: </span>
                      <span className="text-gray-900">
                        {orderData.completedDate
                          ? new Date(
                              orderData.completedDate
                            ).toLocaleDateString('en-GB')
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Dispatched: </span>
                      <span className="text-gray-900">
                        {orderData.dispatchedDate
                          ? new Date(
                              orderData.dispatchedDate
                            ).toLocaleDateString('en-GB')
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(orderData)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
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
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} orders
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
    </div>
  );
}

export default function FactorySalesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FactorySales />
    </ErrorBoundary>
  );
}
