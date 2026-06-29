import { X } from 'lucide-react';
import ProductIndividualList from './ProductIndividualList';
import TableExportButtons from '../../../global/TableExportButtons';
import Pagination from './Pagination';

const ModelModal = ({
  isOpen,
  activeModelId,
  models,
  modalIndividualProducts = [],
  paginatedModalIndividualProducts,
  loading,
  selectedProductIds,
  onProductSelect,
  startSerialNumber,
  endSerialNumber,
  onStartSerialChange,
  onEndSerialChange,
  onSelectRange,
  onUnselectRange,
  onClearSelection,
  factoryFilter,
  onFactoryFilterChange,
  factories,
  boxTypeFilter,
  onBoxTypeFilterChange,
  modalCurrentPage,
  modalTotal,
  modalItemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onClose,
  onTransferClick,
}) => {
  if (!isOpen) return null;

  const modelName =
    models.find((m) => m._id === activeModelId)?.name || 'Details';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-6xl mx-4 flex flex-col max-h-[90vh]">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold">Model: {modelName}</h4>

            <div className="flex flex-wrap items-center gap-2">
              <TableExportButtons
                exportName={`Products_Model_${modelName}`}
                exportData={modalIndividualProducts.map((p) => ({
                  'Model': p.model?.name || p.productName || modelName,
                  'Box Type': `${p.unitsPerBox}N`,
                  'Serial Number': p.serialNumber,
                  'MRP(Price)': `${p.price} /- Each`,
                  'Factory': p.factory?.name || 'N/A',
                  'Distributor': p.distributor ? p.distributor.name : 'N/A',
                }))}
              />
              <button
                onClick={onTransferClick}
                disabled={selectedProductIds.length === 0}
                className={`hidden sm:block px-4 py-2 rounded-md text-sm font-medium ${selectedProductIds.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Transfer to Distributor ({selectedProductIds.length})
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 px-6 overflow-y-auto">
          <ProductIndividualList
            products={paginatedModalIndividualProducts}
            loading={loading}
            selectedProductIds={selectedProductIds}
            onProductSelect={onProductSelect}
            startSerialNumber={startSerialNumber}
            endSerialNumber={endSerialNumber}
            onStartSerialChange={onStartSerialChange}
            onEndSerialChange={onEndSerialChange}
            onSelectRange={onSelectRange}
            onUnselectRange={onUnselectRange}
            onClearSelection={onClearSelection}
            factoryFilter={factoryFilter}
            onFactoryFilterChange={onFactoryFilterChange}
            factories={factories}
            boxTypeFilter={boxTypeFilter}
            onBoxTypeFilterChange={onBoxTypeFilterChange}
          />
        </div>
        {/* Modal pagination controls */}
        <Pagination
          currentPage={modalCurrentPage}
          totalPages={modalTotal}
          itemsPerPage={modalItemsPerPage}
          totalItems={paginatedModalIndividualProducts.length}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          itemName="products"
        />
      </div>
    </div>
  );
};

export default ModelModal;
