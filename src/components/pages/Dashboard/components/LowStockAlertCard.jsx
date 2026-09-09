import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';

export default function LowStockAlertCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/low-stock?threshold=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching low stock items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Low Stock Alert</h3>
            <p className="text-xs text-gray-400">Inventory items below minimum threshold</p>
          </div>
        </div>
        <Link
          to="/inventory"
          className="text-xs font-semibold text-[#4d55f5] hover:text-[#3d45e5] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
            <span className="text-emerald-600 font-semibold">✓ Healthy Inventory</span>
            <span>All active models meet stock threshold levels</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                <th className="py-2.5 px-2">Model</th>
                <th className="py-2.5 px-2 text-center">Current Stock</th>
                <th className="py-2.5 px-2 text-center">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.modelId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="font-semibold text-gray-800 block truncate max-w-[140px]">
                      {item.modelName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {item.modelCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        item.isCritical ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {item.isCritical && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-medium text-gray-500">
                    {item.threshold}
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
