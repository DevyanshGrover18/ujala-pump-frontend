import React from 'react';
import { FilePenLine, Trash2, Box, Clock } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';
import TableExportButtons from '../../../global/TableExportButtons';

export default function FactoryList({
  factories,
  onEdit,
  onDelete,
  onViewOrders,
  loading,
  selectedFactories,
  onSelect,
  onSelectAll,
}) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading factories...</p>
      </div>
    );
  }

  if (!loading && factories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mt-4 text-gray-500 font-medium">
          No factories found
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-end mb-4 mt-4 mr-5">
        <TableExportButtons exportName="Factories_List" />
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  onChange={onSelectAll}
                  checked={
                    factories.length > 0 &&
                    selectedFactories.length === factories.length
                  }
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factory Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <ListComponent
            items={factories}
            renderItem={(factory) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onChange={() => onSelect(factory._id)}
                    checked={selectedFactories.includes(factory._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {factory.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {factory.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {factory.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {factory.contactPerson}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {factory.contactPhone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewOrders(factory)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    {factory.orderCount || 0} Orders
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewOrders(factory, 'pending')}
                    className="inline-flex items-center px-2.5 py-1.5 border border-yellow-500 text-xs font-medium rounded text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {factory.pendingOrderCount || 0} Pending
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(factory)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FilePenLine size={20} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDelete(factory._id)}
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

      <div className="md:hidden space-y-4 p-4">
        {factories.length > 0 ? (
          <ListComponent
            items={factories}
            renderItem={(factory) => (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{factory.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(factory)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FilePenLine size={20} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDelete(factory._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{factory.location}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Contact:</span>{' '}
                    {factory.contactPerson}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Phone:</span>{' '}
                    {factory.contactPhone}
                  </div>
                  <div className="col-span-2 mt-2">
                    <button
                      onClick={() => onViewOrders(factory)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      {factory.orderCount || 0} Total Orders
                    </button>
                  </div>
                  <div className="col-span-2 mt-2">
                    <span className="font-medium">Pending Orders:</span>{' '}
                    {factory.pendingOrderCount || 0}
                  </div>
                </div>
              </div>
            )}
            itemContainer="div"
            listContainer="div"
            listClassName="space-y-4"
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No factories found
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {factories.length}{' '}
            {factories.length === 1 ? 'factory' : 'factories'}
          </span>
        </div>
      </div>
    </>
  );
}
