import React from 'react';
import { Box, FilePenLine, Trash2 } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';
import TableExportButtons from '../../../global/TableExportButtons';

const DistributorTable = ({
  distributors,
  selectedDistributors,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewSales,
  onViewInventory,
  onViewDealers,
}) => {
  const sortedDistributors = [...distributors].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <div className="hidden md:block overflow-x-auto">
      <div className="flex justify-end mb-4 px-4 sm:px-6">
        <TableExportButtons
          exportName="Distributors_List"
          exportData={sortedDistributors.map(d => ({
            'ID': d.distributorId,
            'Name': d.name,
            'Contact Person': d.contactPerson,
            'Contact Phone': d.contactPhone,
            'Sales Count': d.salesCount || 0,
            'Inventory Count': d.inventoryCount || 0,
            'Dealers Count': d.dealerCount || 0
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
                  distributors.length > 0 &&
                  selectedDistributors.length === distributors.length
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
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sales
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inventory
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dealers
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <ListComponent
          items={sortedDistributors}
          renderItem={(distributor) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedDistributors.includes(distributor._id)}
                  onChange={() => onSelect(distributor._id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {distributor.distributorId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {distributor.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <p>{distributor.contactPerson}</p>
                  <p className="text-gray-500">{distributor.contactPhone}</p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewSales(distributor)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {distributor.salesCount || 0} Sales
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewInventory(distributor)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {distributor.inventoryCount || 0} Inventory
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewDealers(distributor)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {distributor.dealerCount || 0} Dealers
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(distributor)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FilePenLine size={20} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete(distributor._id)}
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

export default DistributorTable;
