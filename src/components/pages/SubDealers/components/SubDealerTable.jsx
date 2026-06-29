import React from 'react';
import ListComponent from '../../../global/ListComponent';
import { FilePenLine, Trash2, Box } from 'lucide-react';

export default function SubDealerTable({
  currentItems,
  allFilteredSubDealers = [],
  selectedItems,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewSales,
  onViewInventory,
}) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                onChange={onSelectAll}
                checked={
                  selectedItems.length === currentItems.length &&
                  currentItems.length > 0
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
              District
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dealer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sales
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inventory
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <ListComponent
          items={currentItems}
          renderItem={(sd) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(sd._id)}
                  onChange={() => onSelect(sd._id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {sd.subDealerId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sd.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sd.district}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sd.dealer?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewSales && onViewSales(sd)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {sd.salesCount || 0} Sales
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewInventory && onViewInventory(sd)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {sd.inventoryCount || 0} Inventory
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(sd)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FilePenLine size={20} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete(sd._id)}
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
}
