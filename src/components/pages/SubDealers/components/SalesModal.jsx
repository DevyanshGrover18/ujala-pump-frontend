import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import TableExportButtons from '../../../global/TableExportButtons';

const SalesModal = ({
  isOpen,
  subDealer,
  sales,
  onClose,
  modalCurrentPage,
  modalItemsPerPage,
  onModalPageChange,
  onModalItemsPerPageChange,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter((item) => {
      const itemDate = new Date(item.date || item.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
      return true;
    });
  }, [sales, startDate, endDate]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(filteredSales.length / modalItemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Sales History for {subDealer?.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">List of registered customer purchases.</p>
          </div>
          <div className="flex items-center space-x-4">
            {filteredSales && filteredSales.length > 0 && (
              <TableExportButtons
                exportName={`${subDealer?.name || 'SubDealer'}_Sales`}
                exportData={filteredSales.map((item) => ({
                  'Serial Number': item.product?.serialNumber,
                  'Model': item.product?.model?.name || 'N/A',
                  'Customer Name': item.customerName || 'N/A',
                  'Customer Phone': item.customerPhone || 'N/A',
                  'Date': new Date(item.createdAt).toLocaleDateString()
                }))}
              />
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-shrink-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter by Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                onModalPageChange(1);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#4d55f5] bg-white outline-none"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                onModalPageChange(1);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#4d55f5] bg-white outline-none"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                onModalPageChange(1);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Sales Table Wrapper */}
        <div className="flex-grow overflow-y-auto min-h-0 border border-gray-100 rounded-lg">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No sales records found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Serial Number</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Customer Phone</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedSales.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.product?.serialNumber}</td>
                    <td className="px-4 py-3">{item.product?.model?.name || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">{item.customerPhone || 'N/A'}</td>
                    <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredSales.length > modalItemsPerPage && (
          <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mt-4 flex-shrink-0">
            <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5"
                value={modalItemsPerPage}
                onChange={(e) =>
                  onModalItemsPerPageChange(Number(e.target.value))
                }
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => onModalPageChange(modalCurrentPage - 1)}
                disabled={modalCurrentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {modalCurrentPage} of {totalPages}
              </span>
              <button
                onClick={() => onModalPageChange(modalCurrentPage + 1)}
                disabled={modalCurrentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesModal;
