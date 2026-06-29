import { Eye, FilePenLine, Trash2 } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';

export function OrderCard({
  orders,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  selectedOrders,
  onSelect,
}) {
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

  return (
    <div className="md:hidden p-3">
      {orders.length > 0 ? (
        <ListComponent
          items={orders}
          renderItem={(order) => (
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onChange={() => onSelect(order._id)}
                    checked={selectedOrders.includes(order._id)}
                  />
                  <h3 className="font-medium text-gray-900">
                    {order.model?.name}
                  </h3>
                </div>
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
              </div>
              <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
              <p className="text-sm text-blue-600 font-medium">
                Serial: {order.serialNumber}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Factory:</span>{' '}
                  {order.factory?.name}
                </div>
                <div>
                  <span className="font-medium">Category:</span>{' '}
                  {order.category?.name}
                </div>
                <div>
                  <span className="font-medium">Boxes:</span> {order.quantity}
                </div>
                <div>
                  <span className="font-medium">Total Units:</span>{' '}
                  {getTotalUnits(order)}
                </div>
                <div>
                  <span className="font-medium">Order Type:</span>{' '}
                  {order.orderType === '2_units'
                    ? '2 Units/Box'
                    : order.orderType === '3_units'
                      ? '3 Units/Box'
                      : '1 Unit/Box'}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${order.status === 'Completed' ? 'bg-green-500' : order.status === 'Dispatched' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    ></div>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onStatusChange(order._id, e.target.value)
                      }
                      className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer focus:ring-2 focus:ring-[#4d55f5] focus:border-[#4d55f5] bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
          itemContainer="div"
          listContainer="div"
          itemClassName="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm"
          listClassName="space-y-3"
        />
      ) : (
        <div className="text-center py-12 text-gray-500">No orders</div>
      )}
    </div>
  );
}
