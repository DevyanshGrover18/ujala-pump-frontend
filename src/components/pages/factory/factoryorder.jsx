import { useState, useEffect, useContext } from 'react';
import {
  Eye,
  Search,
  CheckCircle,
  Truck,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { useFactoryOrders } from './hooks/useFactoryOrder';
import OrderDetailsModal from './components/orderDetailModal';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';
import { markFactoryOrdersSeen } from '../FactoryManagement/services/factoryService';
import { AuthContext } from '../../../context/AuthContext';

function FactoryOrders() {
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { user, triggerDashboardRefresh } = useContext(AuthContext);

  const {
    orders,
    loading,
    handleStatusChange,
    downloadMultiplePDFs,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    modelFilter,
    setModelFilter,
    models,
    clearFilters: clearHookFilters,
  } = useFactoryOrders();

  // Start Add this code because api call infinite call
  const factoryId = user?.factory?._id;

  useEffect(() => {
    if (!factoryId) return;

    const markAndRefresh = async () => {
      await markFactoryOrdersSeen(factoryId);
      triggerDashboardRefresh();
    };

    markAndRefresh();
  }, [factoryId]);
  // End Add this code because api call infinite call
  /*
    // // comment this becasue infinte api call reason this
    useEffect(() => {
        const factoryId = user?.factory?._id;
        if (factoryId) {
            const markAndRefresh = async () => {
                await markFactoryOrdersSeen(factoryId);
                triggerDashboardRefresh();
            };
            markAndRefresh();
        }
    }, [user, triggerDashboardRefresh]);
    */

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const uniqueOrders = orders
    .reduce((acc, order) => {
      if (!acc.find((item) => item.orderId === order.orderId)) {
        acc.push(order);
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredUniqueOrders = uniqueOrders.filter(
    (order) =>
      searchTerm === '' ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUniqueOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredUniqueOrders.length / itemsPerPage);

  const clearAllFilters = () => {
    clearHookFilters();
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Your Factory Orders
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                All Orders
              </h2>
              <p className="text-sm text-gray-600">
                {filteredUniqueOrders.length} unique orders found
              </p>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    From:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="endDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    To:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="modelFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Model:
                  </label>
                  <select
                    id="modelFilter"
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Models</option>
                    {models.map((model) => (
                      <option key={model._id} value={model._id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm ml-4"
              >
                Clear Filters
              </button>
            </div>

            {/* Mobile Search and Filter Button */}
            <div className="lg:hidden space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID..."
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
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your orders...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">No orders match your criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    {/* <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th> */}
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Model
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pending
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Completed
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dispatched
                    </th>
                  </tr>
                </thead>
                <ListComponent
                  items={currentItems}
                  renderItem={(order) => {
                    const itemsInOrder = orders.filter(
                      (o) => o.orderId === order.orderId
                    );
                    const completedCount = itemsInOrder.filter(
                      (o) => o.status === 'Completed'
                    ).length;
                    const dispatchedCount = itemsInOrder.filter(
                      (o) => o.status === 'Dispatched'
                    ).length;
                    const pendingCount = itemsInOrder.filter(
                      (o) => o.status === 'Pending'
                    ).length;

                    return (
                      <>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderId}
                        </td>
                        {/* <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.category?.name || 'N/A'}</td> */}
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.model?.name || 'N/A'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${order.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : order.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}
                          >
                            {order.orderType === '2_units'
                              ? '2/Box'
                              : order.orderType === '3_units'
                                ? '3/Box'
                                : '1/Box'}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-GB'
                          )}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-600 text-xs font-medium rounded text-gray-600 hover:bg-gray-600 hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {itemsInOrder.length} Orders
                          </button>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            <Clock className="h-3 w-3 mr-1" />
                            {pendingCount} Pending
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {completedCount} Completed
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            <Truck className="h-3 w-3 mr-1" />
                            {dispatchedCount} Dispatched
                          </div>
                        </td>
                      </>
                    );
                  }}
                  itemContainer="tr"
                  listContainer="tbody"
                  itemClassName="hover:bg-gray-50"
                  listClassName="bg-white divide-y divide-gray-200"
                />
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {currentItems.map((order) => {
                const itemsInOrder = orders.filter(
                  (o) => o.orderId === order.orderId
                );
                const completedCount = itemsInOrder.filter(
                  (o) => o.status === 'Completed'
                ).length;
                const dispatchedCount = itemsInOrder.filter(
                  (o) => o.status === 'Dispatched'
                ).length;
                const pendingCount = itemsInOrder.filter(
                  (o) => o.status === 'Pending'
                ).length;

                return (
                  <div
                    key={order.orderId}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.category?.name || 'N/A'} -{' '}
                          {order.model?.name || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${order.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : order.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {order.orderType === '2_units'
                          ? '2/Box'
                          : order.orderType === '3_units'
                            ? '3/Box'
                            : '1/Box'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      Created:{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        <Clock className="h-3 w-3 mr-1" />
                        {pendingCount} Pending
                      </div>
                      <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {completedCount} Completed
                      </div>
                      <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        <Truck className="h-3 w-3 mr-1" />
                        {dispatchedCount} Dispatched
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewOrder(order)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View {itemsInOrder.length} Items
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {filteredUniqueOrders.length > 0 && (
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
                {Math.min(indexOfLastItem, filteredUniqueOrders.length)} of{' '}
                {filteredUniqueOrders.length} orders
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

      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        selectedOrder={selectedOrder}
        allOrders={orders}
        handleStatusChange={handleStatusChange}
        downloadMultiplePDFs={downloadMultiplePDFs}
      />
    </div>
  );
}

export default function FactoryOrdersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FactoryOrders />
    </ErrorBoundary>
  );
}
