import React from 'react';
import { FilePenLine, Trash2, Box } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';
import TableExportButtons from '../../../global/TableExportButtons';

const DealerTable = ({
  dealers,
  selectedDealers,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewProducts,
  onViewSubDealers,
}) => {
  const sortedDealers = [...dealers].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <div className="hidden md:block overflow-x-auto">
      <div className="flex justify-end mb-4 px-4 sm:px-6">
        <TableExportButtons
          exportName="Dealers_List"
          exportData={sortedDealers.map(d => ({
            'ID': d.dealerId,
            'Name': d.name,
            'Distributor': d.distributor?.name || 'N/A',
            'Products Count': d.productCount || 0,
            'Sub-Dealers Count': Array.isArray(d.subDealers) ? d.subDealers.length : (d.subDealerCount || 0)
          }))}
        />
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                onChange={onSelectAll}
                checked={
                  selectedDealers.length === dealers.length &&
                  dealers.length > 0
                }
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distributor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub-Dealers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <ListComponent
          items={sortedDealers}
          renderItem={(dealer) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedDealers.includes(dealer._id)}
                  onChange={() => onSelect(dealer._id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {dealer.dealerId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dealer.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {dealer.distributor?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewProducts(dealer)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {dealer.productCount || 0} Products
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewSubDealers(dealer)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#10b981] text-xs font-medium rounded text-[#10b981] hover:bg-[#10b981] hover:text-white transition-colors"
                >
                  {Array.isArray(dealer.subDealers)
                    ? dealer.subDealers.length
                    : dealer.subDealerCount || 0}{' '}
                  Sub-Dealers
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(dealer)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FilePenLine size={20} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete(dealer._id)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </td>
            </>
          )}
          itemContainer="tr"
          listContainer="tbody"
          itemClassName="hover:bg-gray-50"
          listClassName="bg-white divide-y divide-gray-200"
        />
      </table>
    </div>
  );
};

export default DealerTable;
