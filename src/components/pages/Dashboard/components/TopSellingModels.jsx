import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';

export default function TopSellingModels() {
  const [period, setPeriod] = useState('thisMonth');
  const [sortBy, setSortBy] = useState('units'); // 'units' | 'revenue'
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopModels = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/top-models?period=${period}&sortBy=${sortBy}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModels(res.data);
      } catch (err) {
        console.error('Error fetching top selling models:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopModels();
  }, [period, sortBy]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Top Selling Models</h3>
          <p className="text-xs text-gray-400">Ranked by volume & revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy((prev) => (prev === 'units' ? 'revenue' : 'units'))}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title={`Sort by ${sortBy === 'units' ? 'Revenue' : 'Units Sold'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:outline-hidden cursor-pointer"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="thisYear">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : models.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-gray-400">
            No sales recorded in this period
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                <th className="py-2.5 px-2 w-8">#</th>
                <th className="py-2.5 px-2">Model</th>
                <th className="py-2.5 px-2 text-right">Units Sold</th>
                <th className="py-2.5 px-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {models.map((m, idx) => (
                <tr key={m.modelId || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2 font-bold text-gray-400">{m.rank}</td>
                  <td className="py-2.5 px-2">
                    <span className="font-semibold text-gray-800 block truncate max-w-[140px]">
                      {m.modelName}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-gray-700">
                    {m.unitsSold?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-gray-900">
                    ₹{m.revenue?.toLocaleString('en-IN')}
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
