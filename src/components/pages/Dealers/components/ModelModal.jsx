import { X } from 'lucide-react';
import DealerProductGroupList from './DealerProductGroupList';
import TableExportButtons from '../../../global/TableExportButtons';
import React from 'react';

const ModelModal = ({
  isOpen,
  activeModelId,
  dealerProducts,
  modalCurrentPage,
  modalItemsPerPage,
  onClose,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (!isOpen) return null;

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter assignments for the selected model
  const filteredAssignments = React.useMemo(() => {
    return (dealerProducts || [])
      .filter((assignment) => assignment.product?.model?._id === activeModelId)
      .sort(
        (a, b) =>
          getSerialCounter(b.product?.serialNumber) -
          getSerialCounter(a.product?.serialNumber)
      );
  }, [dealerProducts, activeModelId]);

  const modalTotal = Math.ceil(filteredAssignments.length / modalItemsPerPage);
  const safePage = Math.min(Math.max(1, modalCurrentPage), modalTotal);
  React.useEffect(() => {
    if (safePage !== modalCurrentPage) onPageChange(safePage);
  }, [safePage, modalCurrentPage, onPageChange]);

  const startIdx = (safePage - 1) * modalItemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(
    startIdx,
    startIdx + modalItemsPerPage
  );

  const modelName = React.useMemo(() => {
    const found = dealerProducts.find(
      (g) => g.product?.model?._id === activeModelId
    );
    return found ? found.product.model?.name : 'Details';
  }, [dealerProducts, activeModelId]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-6xl mx-4 flex flex-col max-h-[90vh]">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold">Model: {modelName}</h4>
            <div className="flex items-center gap-4">
              {filteredAssignments.length > 0 && (
                <TableExportButtons
                  exportName={`Model_${modelName}_Products`}
                  exportData={filteredAssignments.map(assignment => {
                    const product = assignment.product;
                    return {
                      'Model': product.model?.name || 'N/A',
                      'Serial Number': product.serialNumber,
                      'Assigned By': assignment.distributor?.name || 'N/A',
                      'Assigned To': product.assignedToSubDealer ? product.assignedToSubDealer.name : 'Not Assigned',
                      'Status': product.sold ? 'Sold' : (product.assignedToSubDealer ? 'Assigned' : 'Available')
                    };
                  })}
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
            className="text-blue-600 hover:bg-gray-200 text-left border p-2 rounded-lg"
          >
            &larr; Back to Models
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found for this model
            </div>
          ) : (
            <DealerProductGroupList products={paginatedAssignments} />
          )}
        </div>

        <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
            <span>Rows per page:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5"
              value={modalItemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => onPageChange(modalCurrentPage - 1)}
              disabled={modalCurrentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {modalCurrentPage}
            </span>
            <button
              onClick={() => onPageChange(modalCurrentPage + 1)}
              disabled={modalCurrentPage === modalTotal}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelModal;
