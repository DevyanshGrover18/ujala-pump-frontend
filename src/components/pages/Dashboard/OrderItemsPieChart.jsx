import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderItemsPieChart() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState({ total: 0, pending: 0, completed: 0, dispatched: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/order-items-chart?period=${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching order items data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const total = data.pending + data.completed + data.dispatched;

  const pendingPercentage = total > 0 ? (data.pending / total) * 100 : 0;
  const completedPercentage = total > 0 ? (data.completed / total) * 100 : 0;
  const dispatchedPercentage = total > 0 ? (data.dispatched / total) * 100 : 0;

  // SVG Donut calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  const pendingOffset = 0;
  const completedOffset = (pendingPercentage / 100) * circumference;
  const dispatchedOffset =
    ((pendingPercentage + completedPercentage) / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">Order Items Status</h3>
          <p className="text-xs text-gray-400">Production & Dispatch Breakdown</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:outline-hidden cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
        <div className="relative flex items-center justify-center">
          {loading ? (
            <div className="w-44 h-44 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <svg width="170" height="170" className="transform -rotate-90">
                <circle
                  cx="85"
                  cy="85"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="16"
                />
                {/* Pending */}
                {pendingPercentage > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeDasharray={`${(pendingPercentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-pendingOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                )}
                {/* Completed */}
                {completedPercentage > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={`${(completedPercentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-completedOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                )}
                {/* Dispatched */}
                {dispatchedPercentage > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="16"
                    strokeDasharray={`${(dispatchedPercentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-dispatchedOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  {total.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-medium text-gray-400">
                  Total Items
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-3 min-w-[140px]">
          <div className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0"></span>
              <span className="text-gray-600 font-medium">Pending</span>
            </div>
            <span className="font-bold text-gray-800">
              {data.pending} ({pendingPercentage.toFixed(1)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0"></span>
              <span className="text-gray-600 font-medium">Completed</span>
            </div>
            <span className="font-bold text-gray-800">
              {data.completed} ({completedPercentage.toFixed(1)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-purple-500 shrink-0"></span>
              <span className="text-gray-600 font-medium">Dispatched</span>
            </div>
            <span className="font-bold text-gray-800">
              {data.dispatched} ({dispatchedPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
