import React from 'react';
import { Box, FilePenLine, Trash2 } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';

const DistributorCard = ({
  distributors,
  selectedDistributors,
  onSelect,
  onEdit,
  onDelete,
  onViewSales,
  onViewInventory,
  onViewDealers,
  onStatusChange,
}) => {
  return (
    <div className="md:hidden space-y-4">
      {distributors.length > 0 ? (
        <ListComponent
          items={distributors}
          renderItem={(distributor) => (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">
                  {distributor.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDistributors.includes(distributor._id)}
                    onChange={() => onSelect(distributor._id)}
                  />
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
              </div>
              <p className="text-sm text-gray-600">
                {distributor.distributorId}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">State:</span>{' '}
                  {distributor.state}
                </div>
                <div>
                  <span className="font-medium">District:</span>{' '}
                  {distributor.district}
                </div>
                {distributor.addressLine2 && (
                  <div>
                    <span className="font-medium">Address Line 2:</span>{' '}
                    {distributor.addressLine2}
                  </div>
                )}
                <div>
                  <span className="font-medium">Pincode:</span>{' '}
                  {distributor.pincode}
                </div>
                <div>
                  <span className="font-medium">GST Number:</span>{' '}
                  {distributor.gstNumber}
                </div>
                <div>
                  <span className="font-medium">Contact Person:</span>{' '}
                  {distributor.contactPerson}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{' '}
                  {distributor.contactPhone}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${distributor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    <select
                      value={distributor.status}
                      onChange={(e) =>
                        onStatusChange(distributor._id, e.target.value)
                      }
                      className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer focus:ring-2 focus:ring-[#4d55f5] focus:border-[#4d55f5] bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2 mt-2 flex gap-2">
                  <button
                    onClick={() => onViewSales(distributor)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    {distributor.salesCount || 0} Sales
                  </button>
                  <button
                    onClick={() => onViewInventory(distributor)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    {distributor.inventoryCount || 0} Inventory
                  </button>
                </div>
                <div className="col-span-2 mt-2">
                  <button
                    onClick={() => onViewDealers(distributor)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    {distributor.dealerCount || 0} Dealers
                  </button>
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
          No distributors found
        </div>
      )}
    </div>
  );
};

export default DistributorCard;
