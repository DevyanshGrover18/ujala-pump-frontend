import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/recent-orders?limit=6`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dispatched':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
          <p className="text-xs text-gray-400">Latest production orders dispatched</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-semibold text-[#4d55f5] hover:text-[#3d45e5] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-gray-400">
            No orders found
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                <th className="py-2.5 px-2">Order #</th>
                <th className="py-2.5 px-2">Factory</th>
                <th className="py-2.5 px-2">Model</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2 font-mono font-bold text-gray-800">
                    {o.orderId}
                  </td>
                  <td className="py-2.5 px-2 text-gray-600 font-medium">
                    {o.factoryName}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-gray-900 truncate max-w-[120px]">
                    {o.modelName}
                  </td>
                  <td className="py-2.5 px-2 text-center font-medium text-gray-700">
                    {o.quantity}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-400 font-medium">
                    {new Date(o.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
