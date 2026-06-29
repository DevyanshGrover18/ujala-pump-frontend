import React from 'react';

export default function DealerProductGroupList({
  products,
  onProductSelect,
  selectedProducts = [],
  hideCheckbox = false,
}) {
  // The 'products' prop is an array of assignment objects.
  // Each assignment object has a 'product' property.
  // The component should render a flat list of products.

  // If no products found, show empty message
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products found for this dealer
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {!hideCheckbox && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Serial Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((assignment) => {
            const product = assignment.product;
            const isSelected = selectedProducts.some(
              (p) => p._id === product._id
            );
            const isSold = product.sold;
            const isAssigned = product.assignedToSubDealer;
            const hasAvailableProducts = !isSold && !isAssigned;

            return (
              <tr
                key={assignment._id}
                className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-100' : ''} ${isSold || isAssigned ? 'bg-gray-100 opacity-60' : ''}`}
              >
                {!hideCheckbox && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onProductSelect(assignment)}
                      disabled={!hasAvailableProducts}
                    />
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.model?.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.serialNumber}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {assignment.distributor?.name || 'N/A'}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isAssigned ? (
                    <span className="text-purple-600 font-medium">
                      {product.assignedToSubDealer?.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not Assigned</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isSold
                        ? 'bg-red-100 text-red-800'
                        : isAssigned
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isSold ? 'Sold' : isAssigned ? 'Assigned' : 'Available'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
