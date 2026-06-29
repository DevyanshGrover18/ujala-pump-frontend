import React, { useState } from 'react';
import { X, Package, Box, Calendar, Tag } from 'lucide-react';

const ViewSaleModal = ({ isOpen, onClose, saleData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  if (!isOpen) return null;

  const groupedItems = saleData.items.reduce((acc, item) => {
    const { boxNumber } = item;
    if (!acc[boxNumber]) {
      acc[boxNumber] = [];
    }
    acc[boxNumber].push(item);
    return acc;
  }, {});

  const groupedItemsArray = Object.entries(groupedItems);
  const totalItems = groupedItemsArray.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = groupedItemsArray.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Order Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              View complete order information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-white hover:text-gray-800 transition-all duration-200 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {saleData ? (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 h-full">
              {/* Left Column - Order Information (2 columns on large screens) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 sm:p-6 rounded-xl border border-blue-100 h-fit sticky top-0">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Order Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Order ID */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Order ID
                          </p>
                          <p className="text-sm sm:text-base font-mono font-semibold text-gray-900 break-all">
                            {saleData.orderId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-start">
                        <Box className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Category
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {saleData.category?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Model */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-start">
                        <Package className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Model
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {saleData.model?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Items List (3 columns on large screens) */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                          <Box className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            Items
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {totalItems} box(es) total
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="space-y-4">
                      {paginatedItems.map(([boxNumber, items]) => (
                        <div
                          key={boxNumber}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center mb-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-600 text-white rounded-lg font-bold text-sm mr-3">
                              {boxNumber}
                            </div>
                            <p className="text-sm font-bold text-gray-700">
                              Box #{boxNumber}
                            </p>
                            <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                              {items.length} item(s)
                            </span>
                          </div>

                          <div className="space-y-2">
                            {items.map((item, index) => (
                              <div
                                key={item._id || index}
                                className="bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200"
                              >
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <p className="text-sm font-mono text-gray-900 break-all flex-1">
                                      {item.serialNumber}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="h-3 w-3 mr-1.5 text-green-500" />
                                      <span className="font-medium mr-1">
                                        Completed:
                                      </span>
                                      <span>
                                        {item.completedAt
                                          ? new Date(
                                              item.completedAt
                                            ).toLocaleDateString()
                                          : '-'}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="h-3 w-3 mr-1.5 text-blue-500" />
                                      <span className="font-medium mr-1">
                                        Dispatched:
                                      </span>
                                      <span>
                                        {item.dispatchedAt
                                          ? new Date(
                                              item.dispatchedAt
                                            ).toLocaleDateString()
                                          : '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="mr-2 font-medium">Rows per page:</span>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200 bg-white"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200 bg-white"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500 flex-1 flex items-center justify-center">
            <div>
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium">No sales data available.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSaleModal;
