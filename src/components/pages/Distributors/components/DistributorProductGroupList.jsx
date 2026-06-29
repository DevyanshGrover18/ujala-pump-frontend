import './TableList.css';

export default function DistributorProductGroupList({
  products,
  selectedProductGroups = [],
  setSelectedProductGroups,
}) {
  const handleSelectAll = (e) => {
    if (!setSelectedProductGroups) return;
    if (e.target.checked) {
      // Only select unassigned products
      const unassignedProducts = products.filter((p) => !p.assignedTo);
      setSelectedProductGroups(unassignedProducts);
    } else {
      setSelectedProductGroups([]);
    }
  };

  const handleSelectRow = (e, product) => {
    if (!setSelectedProductGroups) return;
    if (e.target.checked) {
      setSelectedProductGroups([...selectedProductGroups, product]);
    } else {
      setSelectedProductGroups(
        selectedProductGroups.filter((p) => p._id !== product._id)
      );
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products found for this distributor
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 responsive-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    products.length > 0 &&
                    products.every((p) =>
                      selectedProductGroups.some(
                        (selected) => selected._id === p._id
                      )
                    )
                  }
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned to
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const isAssigned = product.assignedTo;
              const isSold = product.sold;
              return (
                <tr
                  key={product._id}
                  className={`hover:bg-gray-50 ${isAssigned || isSold ? 'bg-gray-100 text-gray-500' : ''}`}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    data-label="Select"
                  >
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectRow(e, product)}
                      checked={
                        selectedProductGroups &&
                        selectedProductGroups.some((p) => p._id === product._id)
                      }
                      disabled={isAssigned || isSold}
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    data-label="Serial Number"
                  >
                    {product.serialNumber}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-label="Model">{product.productName}</td> */}
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    data-label="Model"
                  >
                    {product.model?.name}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    data-label="Factory"
                  >
                    {product.factory?.name}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    data-label="Assigned to"
                  >
                    {isAssigned ? product.assignedTo : 'Not Assigned'}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Status"
                  >
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isSold
                          ? 'bg-red-100 text-red-800'
                          : isAssigned
                            ? 'bg-yellow-100 text-yellow-800'
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
    </>
  );
}
