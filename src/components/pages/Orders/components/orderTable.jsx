import { Eye, FilePenLine, Trash2, Truck } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';
import TableExportButtons from '../../../global/TableExportButtons';

export function OrderTable({
  orders,
  allFilteredOrders = [],
  onView,
  onEdit,
  onDelete,
  selectedOrders,
  onSelect,
  onSelectAll,
}) {
  const getOrderTypeDisplay = (orderType) => {
    const types = {
      '1_unit': {
        label: '1 Unit/Box',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      },
      '2_units': {
        label: '2 Units/Box',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      },
      '3_units': {
        label: '3 Units/Box',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
      },
    };
    return types[orderType] || types['1_unit'];
  };

  const getTotalUnits = (order) => {
    return (
      order.totalUnits ||
      order.quantity *
      (order.orderType === '2_units'
        ? 2
        : order.orderType === '3_units'
          ? 3
          : 1)
    );
  };

  const exportData = allFilteredOrders.map(order => ({
    'Order ID': order.orderId,
    'Serial Number': order.serialNumber,
    'Factory': order.factory?.name || '',
    'Model': order.model?.name || '',
    'Boxes': order.quantity,
    'Total Units': getTotalUnits(order),
    'Dispatched': order.dispatchedUnits
  }));

  return (
    <>
      <div className="flex justify-end mb-4 mt-4 px-4 sm:px-6">
        <TableExportButtons exportName="Orders_List" exportData={exportData} />
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
                    orders.length > 0 && selectedOrders.length === orders.length
                  }
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ORDER ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SERIAL NUMBER
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FACTORY
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MODEL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BOXES
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TOTAL UNITS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DISPATCHED
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER TYPE</th> */}
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <ListComponent
            items={orders}
            renderItem={(order) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onChange={() => onSelect(order._id)}
                    checked={selectedOrders.includes(order._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {order.serialNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.factory?.name}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.category?.name}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.model?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {getTotalUnits(order)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    <Truck className="h-4 w-4 mr-1.5" />
                    {order.dispatchedUnits} Dispatched
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderTypeDisplay(order.orderType).bgColor} ${getOrderTypeDisplay(order.orderType).textColor}`}>
                  {getOrderTypeDisplay(order.orderType).label}
                </span>
              </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(order)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={20} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => onEdit(order)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FilePenLine size={20} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDelete(order)}
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
    </>
  );
}
