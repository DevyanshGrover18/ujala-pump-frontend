import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  showItemCount = true,
}) => {
  return (
    <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <span className="whitespace-nowrap">Rows per page:</span>
          <select
            className="ml-2 border border-gray-300 rounded px-2 py-1"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="75">75</option>
            <option value="100">100</option>
          </select>
        </div>

        {showItemCount && (
          <div className="hidden md:block text-sm text-gray-700">
            Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{' '}
            to {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
            {totalItems} items
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end space-x-2">
        {showItemCount && (
          <div className="text-sm text-gray-700 md:hidden">
            Page {currentPage} of {totalPages}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 hidden md:inline">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
