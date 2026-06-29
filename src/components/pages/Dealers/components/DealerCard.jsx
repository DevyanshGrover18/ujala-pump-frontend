import React from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';

const DealerCard = ({ dealers, onEdit, onDelete, onViewSales, onViewInventory }) => {
  return (
    <div className="md:hidden space-y-4">
      {dealers.length > 0 ? (
        <ListComponent
          items={dealers}
          renderItem={(dealer) => (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{dealer.name}</h3>
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
              </div>
              <p className="text-sm text-gray-600">{dealer.dealerId}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Address:</span>{' '}
                  {dealer.addressLine1}, {dealer.addressLine2}
                </div>
                <div>
                  <span className="font-medium">State:</span> {dealer.state}
                </div>
                <div>
                  <span className="font-medium">District:</span>{' '}
                  {dealer.district}
                </div>
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  {dealer.location}
                </div>
                <div>
                  <span className="font-medium">Pincode:</span> {dealer.pincode}
                </div>
                <div>
                  <span className="font-medium">Contact:</span>{' '}
                  {dealer.contactPerson}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{' '}
                  {dealer.contactPhone}
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dealer.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {dealer.status}
                  </span>
                </div>
                <div className="col-span-2 mt-2 flex gap-2">
                  <button
                    onClick={() => onViewSales(dealer)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                  >
                    {dealer.salesCount || 0} Sales
                  </button>
                  <button
                    onClick={() => onViewInventory(dealer)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                  >
                    {dealer.inventoryCount || 0} Inventory
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
        <div className="text-center py-12 text-gray-500">No dealers found</div>
      )}
    </div>
  );
};

export default DealerCard;
