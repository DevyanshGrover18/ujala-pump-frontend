import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  showItemCount = true,
  itemName = 'items',
}) => {
  return (
    <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
        <span>Rows per page:</span>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        {showItemCount && (
          <span className="text-sm text-gray-700 hidden sm:inline">
            Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{' '}
            to {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
            {totalItems} {itemName}
          </span>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 flex-shrink-0">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
