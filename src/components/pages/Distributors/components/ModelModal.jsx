import React from 'react';
import { X } from 'lucide-react';
import TableExportButtons from '../../../global/TableExportButtons';

const ModelModal = ({
  isOpen,
  activeModelId,
  products,
  onClose,
  modalCurrentPage,
  modalItemsPerPage,
  onModalPageChange,
  onModalItemsPerPageChange,
}) => {
  if (!isOpen) return null;

  const found = products.find((p) => p.model?._id === activeModelId);
  const foundModelName = found ? found.model?.name : 'Details';

  // Filter products for the selected model
  const filteredProducts = (products || [])
    .filter((p) => p.model?._id === activeModelId)
    .sort((a, b) => {
      const getSerialCounter = (serialNumber) => {
        if (!serialNumber) return 0;
        const match = serialNumber.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      };
      return getSerialCounter(b.serialNumber) - getSerialCounter(a.serialNumber);
    });

  const modalTotal = Math.ceil(filteredProducts.length / modalItemsPerPage) || 1;
  const safePage = Math.min(Math.max(1, modalCurrentPage), modalTotal);

  // Only trigger effect-like state changes if we actually need to correct the page
  if (safePage !== modalCurrentPage && isOpen) {
    setTimeout(() => onModalPageChange(safePage), 0);
  }

  const startIdx = (safePage - 1) * modalItemsPerPage;
  const paginated = filteredProducts.slice(startIdx, startIdx + modalItemsPerPage);

  const exportData = filteredProducts.map(product => ({
    'Serial Number': product.serialNumber,
    'Category': product.category?.name || 'N/A',
    'Model': product.model?.name || 'N/A',
    'Factory': product.factory?.name || 'N/A',
    'Status': product.sold ? 'Sold' : 'Available'
  }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-6xl mx-4 flex flex-col max-h-[90vh]">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold">
              Model: {foundModelName}
            </h4>
            <div className="flex items-center gap-4">
              {filteredProducts.length > 0 && (
                <TableExportButtons
                  exportName={`Model_${foundModelName}_Products`}
                  exportData={exportData}
                />
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-600 hover:bg-gray-200 text-left border p-2 rounded-lg mt-2"
          >
            &larr; Back to Models
          </button>
        </div>
        <div className="flex-1 min-h-0 px-6 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found for this model
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Serial Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Model
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Factory
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium">
                          {product.serialNumber}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {product.category?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {product.model?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {product.factory?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${product.sold
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {product.sold ? 'Sold' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredProducts.length > modalItemsPerPage && (
                <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mt-4">
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
                      disabled={modalCurrentPage <= 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-gray-700">
                      Page {modalCurrentPage} of {modalTotal}
                    </span>

                    <button
                      onClick={() => onModalPageChange(modalCurrentPage + 1)}
                      disabled={modalCurrentPage >= modalTotal}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelModal;
