import { X, Box } from 'lucide-react';
import DistributorProductGroupList from './DistributorProductGroupList';
import TableExportButtons from '../../../global/TableExportButtons';

const ProductsModal = ({
  isOpen,
  distributor,
  products,
  onClose,
  onOpenModel,
  modalCurrentPage,
  modalItemsPerPage,
  onModalPageChange,
  onModalItemsPerPageChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Products for {distributor?.name}
          </h3>
          <div className="flex items-center space-x-4">
            {products && products.length > 0 && (
              <TableExportButtons
                exportName={`${distributor?.name || 'Distributor'}_Products`}
                exportData={(() => {
                  const map = {};
                  (products || []).forEach((p) => {
                    const mid = p.model?._id || 'unknown';
                    if (!map[mid])
                      map[mid] = {
                        model: p.model || { name: 'Unknown' },
                        count: 0,
                      };
                    map[mid].count += 1;
                  });
                  return Object.values(map).map(mg => ({
                    'Model Name': mg.model?.name || 'Unknown',
                    'Product Count': mg.count || 0
                  }));
                })()}
              />
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          {(() => {
            const map = {};
            (products || []).forEach((p) => {
              const mid = p.model?._id || 'unknown';
              if (!map[mid])
                map[mid] = {
                  model: p.model || { name: 'Unknown' },
                  count: 0,
                  products: [],
                };
              map[mid].count += 1;
              map[mid].products.push(p);
            });
            const modelGroups = Object.values(map);
            if (modelGroups.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  No products found for this distributor
                </div>
              );
            }

            const totalModalPages =
              Math.ceil(modelGroups.length / modalItemsPerPage) || 1;
            const modalPageItems = (() => {
              const start = (modalCurrentPage - 1) * modalItemsPerPage;
              return modelGroups.slice(start, start + modalItemsPerPage);
            })();

            return (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalPageItems.map((mg) => (
                        <tr
                          key={mg.model?._id || mg.model.name}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mg.model?.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => onOpenModel(mg.model?._id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                            >
                              <Box className="h-4 w-4 mr-1" />
                              {mg.count || 0} Products
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-4">
                  {modalPageItems.map((mg) => (
                    <div
                      key={mg.model?._id || mg.model.name}
                      className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {mg.model?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {mg.count || 0} Products
                        </p>
                      </div>
                      <button
                        onClick={() => onOpenModel(mg.model?._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Box className="h-4 w-4" />
                        View Products
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination for model groups */}
                {modelGroups.length > modalItemsPerPage && (
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
                        disabled={modalCurrentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {modalCurrentPage} of {totalModalPages}
                      </span>
                      <button
                        onClick={() => onModalPageChange(modalCurrentPage + 1)}
                        disabled={modalCurrentPage === totalModalPages}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProductsModal;
