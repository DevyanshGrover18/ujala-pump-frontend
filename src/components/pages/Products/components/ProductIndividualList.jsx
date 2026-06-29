import React from 'react';
import '../../Distributors/components/TableList.css';

export default function ProductIndividualList({
  products,
  loading,
  selectedProductIds,
  onProductSelect,
  factories,
  factoryFilter,
  onFactoryFilterChange,
  startSerialNumber,
  endSerialNumber,
  onStartSerialChange,
  onEndSerialChange,
  onSelectRange,
  onUnselectRange,
  onClearSelection,
  boxTypeFilter,
  onBoxTypeFilterChange,
}) {
  const handleClearAll = () => {
    onClearSelection && onClearSelection();
    onFactoryFilterChange && onFactoryFilterChange('');
    onBoxTypeFilterChange && onBoxTypeFilterChange('');
    onStartSerialChange && onStartSerialChange('');
    onEndSerialChange && onEndSerialChange('');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading products...</p>
      </div>
    );
  }

  const availableProducts = (products || []).filter((p) => !p.distributor);

  return (
    <div className="overflow-x-auto">
      <div className="bg-white rounded-lg p-2 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factory
            </label>
            <select
              value={factoryFilter}
              onChange={(e) =>
                onFactoryFilterChange && onFactoryFilterChange(e.target.value)
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Factories</option>
              {factories?.map((factory) => (
                <option key={factory._id} value={factory._id}>
                  {factory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Box Type
            </label>
            <select
              value={boxTypeFilter}
              onChange={(e) =>
                onBoxTypeFilterChange && onBoxTypeFilterChange(e.target.value)
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All</option>
              <option value="1">1N</option>
              <option value="2">2N</option>
              <option value="3">3N</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mt-4">
          <div className="lg:col-span-8 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Serial
              </label>
              <input
                value={startSerialNumber}
                onChange={(e) =>
                  onStartSerialChange && onStartSerialChange(e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Serial
              </label>
              <input
                value={endSerialNumber}
                onChange={(e) =>
                  onEndSerialChange && onEndSerialChange(e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-2 justify-end">
            <div className="flex gap-2">
              <button
                onClick={() => onSelectRange && onSelectRange()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Select Range
              </button>
              <button
                onClick={() => onUnselectRange && onUnselectRange()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Unselect Range
              </button>
            </div>
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200 responsive-table">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-4 w-12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={
                  availableProducts.length > 0 &&
                  availableProducts.every((p) =>
                    selectedProductIds.includes(p._id)
                  )
                }
                onChange={(e) =>
                  onProductSelect(
                    availableProducts.map((p) => p._id),
                    e.target.checked
                  )
                }
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Box Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Serial Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MRP(Price)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Factory
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distributor
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr
              key={product._id}
              className={`hover:bg-gray-50 ${product.distributor ? 'bg-gray-100' : ''}`}
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={selectedProductIds.includes(product._id)}
                  onChange={(e) =>
                    onProductSelect(product._id, e.target.checked)
                  }
                  disabled={!!product.distributor}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.model?.name || product.productName}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.unitsPerBox}N
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.serialNumber}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.price} /- Each
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.factory?.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.distributor ? product.distributor.name : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
