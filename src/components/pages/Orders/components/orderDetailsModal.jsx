import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import TableExportButtons from '../../../global/TableExportButtons';

const toast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
};

export function OrderDetailsModal({
  isOpen,
  order,
  factoryStats,
  orderItems,
  modalTab,
  onTabChange,
  onClose,
  onDispatch,
}) {
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [rangeErrorModalOpen, setRangeErrorModalOpen] = useState(false);
  const [rangeErrorMessage, setRangeErrorMessage] = useState('');
  const [availableRange, setAvailableRange] = useState('');

  if (!isOpen || !order) return null;

  const filteredOrderItems = orderItems.filter((item) =>
    item.serialNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );

  const getTotalUnits = () => {
    return (
      order.totalUnits ||
      order.quantity *
      (order.orderType === '2_units'
        ? 2
        : order.orderType === '3_units'
          ? 3
          : 1)
    );
  };

  const dispatchedItemsForDisplay = orderItems.filter(
    (item) => item.status === 'Dispatched'
  );

  const dispatchedPercentage =
    factoryStats.completedItems > 0
      ? Math.round(
        (factoryStats.dispatchedItems / factoryStats.completedItems) * 100
      )
      : 0;

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Selection/range-based transfer UI removed — transfers are handled automatically

  // FIX: Properly create groupedItems array
  const groupedItems = Object.values(
    filteredOrderItems.reduce((acc, item) => {
      if (!acc[item.boxNumber]) {
        acc[item.boxNumber] = {
          boxNumber: item.boxNumber,
          itemIds: [],
          serialNumbers: [],
          status: item.status,
          createdAt: item.createdAt,
          dispatchedAt: null,
          completedAt: null,
          isTransferredToProduct: true,
        };
      }
      if (item.dispatchedAt)
        acc[item.boxNumber].dispatchedAt = item.dispatchedAt;
      if (item.completedAt) acc[item.boxNumber].completedAt = item.completedAt;
      if (!item.isTransferredToProduct) {
        acc[item.boxNumber].isTransferredToProduct = false;
      }
      acc[item.boxNumber].itemIds.push(item._id);
      acc[item.boxNumber].serialNumbers.push(item.serialNumber);
      return acc;
    }, {})
  );

  // FIX: Calculate pagination with proper total pages handling
  const totalPages = Math.max(1, Math.ceil(groupedItems.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedItems.slice(indexOfFirstItem, indexOfLastItem);

  const exportData = groupedItems.map((groupedItem) => ({
    'Box': `Box ${groupedItem.boxNumber}`,
    'Serial Number': groupedItem.serialNumbers.join(', '),
    'Status': groupedItem.status,
    'Created Date': groupedItem.createdAt && !isNaN(new Date(groupedItem.createdAt))
      ? new Date(groupedItem.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      : '-',
    'Dispatched Date': groupedItem.dispatchedAt && !isNaN(new Date(groupedItem.dispatchedAt))
      ? new Date(groupedItem.dispatchedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      : '-',
    'Completion Date': groupedItem.completedAt && !isNaN(new Date(groupedItem.completedAt))
      ? new Date(groupedItem.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      : '-',
    'Transferred': groupedItem.isTransferredToProduct ? 'Yes' : 'No'
  }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          <div className="flex items-center space-x-4">
            <TableExportButtons exportName={`${order.orderId}_Details`} exportData={exportData} />
            <div className="flex items-center space-x-2">
              {modalTab === 'details' && order.status === 'Completed' && (
                <button
                  onClick={onDispatch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Mark as Dispatched
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => onTabChange('summary')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${modalTab === 'summary'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Summary
            </button>
            <button
              onClick={() => onTabChange('details')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${modalTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Details
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modalTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-base font-medium text-gray-900">
                  {order.orderId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Creation Date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="text-base font-medium text-blue-600">
                  {order.serialNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-base font-medium text-gray-900">
                  {order.category?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="text-base font-medium text-gray-900">
                  {order.model?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Boxes</p>
                <p className="text-base font-medium text-gray-900">
                  {order.quantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-base font-medium text-blue-600">
                  {getTotalUnits()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Type</p>
                <p className="text-base font-medium text-gray-900">
                  {order.orderType === '2_units'
                    ? '2 Units per Box'
                    : order.orderType === '3_units'
                      ? '3 Units per Box'
                      : '1 Unit per Box'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Factory</p>
                <p className="text-base font-medium text-gray-900">
                  {order.factory?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base font-medium text-gray-900">
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transferred to Product</p>
                <p className="text-base font-medium text-gray-900">
                  {order.isTransferredToProduct ? 'Yes' : 'No'}
                </p>
              </div>

              {factoryStats.totalItems && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Factory Production Status
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Completed
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {factoryStats.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${factoryStats.completionPercentage}%`,
                        }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-7">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">
                          {factoryStats.totalItems}
                        </div>
                        <div className="text-gray-600">Total Items</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">
                          {factoryStats.completedItems}
                        </div>
                        <div className="text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">
                          {factoryStats.pendingItems}
                        </div>
                        <div className="text-gray-600">Pending</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Dispatched
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {dispatchedPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${dispatchedPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="font-bold text-blue-600">
                          {factoryStats.dispatchedItems} /{' '}
                          {factoryStats.completedItems}
                        </div>
                        <div className="text-gray-600">
                          Dispatched / Completed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {modalTab === 'details' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by serial number..."
                      value={orderSearchTerm}
                      onChange={(e) => {
                        setOrderSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                {/* DESKTOP TABLE */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Box
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispatched Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transferred
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            No items found
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((groupedItem) => (
                          <tr
                            key={groupedItem.boxNumber}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              Box {groupedItem.boxNumber}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600">
                              {groupedItem.serialNumbers.map((serial) => (
                                <div key={serial}>{serial}</div>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${groupedItem.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : groupedItem.status === 'Dispatched'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                              >
                                {groupedItem.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {groupedItem.createdAt &&
                                !isNaN(new Date(groupedItem.createdAt))
                                ? new Date(
                                  groupedItem.createdAt
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {groupedItem.dispatchedAt &&
                                !isNaN(new Date(groupedItem.dispatchedAt))
                                ? new Date(
                                  groupedItem.dispatchedAt
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {groupedItem.completedAt &&
                                !isNaN(new Date(groupedItem.completedAt))
                                ? new Date(
                                  groupedItem.completedAt
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {groupedItem.isTransferredToProduct
                                ? 'Yes'
                                : 'No'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="md:hidden space-y-4">
                  {currentItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No items found
                    </div>
                  ) : (
                    currentItems.map((groupedItem) => (
                      <div
                        key={groupedItem.boxNumber}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-base font-semibold text-gray-800">
                            Box {groupedItem.boxNumber}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${groupedItem.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : groupedItem.status === 'Dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {groupedItem.status}
                          </span>
                        </div>

                        <div className="text-sm mb-2 text-gray-700">
                          <span className="font-medium">Serial Numbers:</span>
                          <div className="mt-1 text-blue-600 space-y-0.5">
                            {groupedItem.serialNumbers.map((serial) => (
                              <div key={serial}>{serial}</div>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <span className="font-medium">Created:</span>{' '}
                            {groupedItem.createdAt &&
                              !isNaN(new Date(groupedItem.createdAt))
                              ? new Date(
                                groupedItem.createdAt
                              ).toLocaleDateString()
                              : '-'}
                          </p>
                          <p>
                            <span className="font-medium">Dispatched:</span>{' '}
                            {groupedItem.dispatchedAt &&
                              !isNaN(new Date(groupedItem.dispatchedAt))
                              ? new Date(
                                groupedItem.dispatchedAt
                              ).toLocaleDateString()
                              : '-'}
                          </p>
                          <p>
                            <span className="font-medium">Completed:</span>{' '}
                            {groupedItem.completedAt &&
                              !isNaN(new Date(groupedItem.completedAt))
                              ? new Date(
                                groupedItem.completedAt
                              ).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>

                        <p className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Transferred:
                          </span>{' '}
                          {groupedItem.isTransferredToProduct ? 'Yes' : 'No'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {modalTab === 'details' && (
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
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm text-gray-700 hidden sm:inline">
                Showing {groupedItems.length === 0 ? 0 : indexOfFirstItem + 1}{' '}
                to {Math.min(indexOfLastItem, groupedItems.length)} of{' '}
                {groupedItems.length} boxes
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
        )}

        {rangeErrorModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setRangeErrorModalOpen(false)}
            ></div>
            <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-md p-6 mx-4">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold">Range Error</h4>
                <button
                  onClick={() => setRangeErrorModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                <p>
                  {rangeErrorMessage}{' '}
                  <span className="font-medium">({availableRange})</span>
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setRangeErrorModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsModal;
