import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderItemsPieChart() {
  const [data, setData] = useState({ pending: 0, completed: 0, dispatched: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/order-items`
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching order items data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = data.pending + data.completed + data.dispatched;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse bg-gray-200 h-32 w-32 rounded-full"></div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No order items found
      </div>
    );
  }

  const pendingPercentage = (data.pending / total) * 100;
  const completedPercentage = (data.completed / total) * 100;
  const dispatchedPercentage = (data.dispatched / total) * 100;

  // Create SVG pie chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const pendingOffset = 0;
  const completedOffset = (pendingPercentage / 100) * circumference;
  const dispatchedOffset =
    ((pendingPercentage + completedPercentage) / 100) * circumference;

  return (
    <div className="flex flex-row justify-center space-x-10 items-center">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
          />
          {/* Pending */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeDasharray={`${(pendingPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={-pendingOffset}
            className="transition-all duration-1000"
          />
          {/* Completed */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeDasharray={`${(completedPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={-completedOffset}
            className="transition-all duration-1000"
          />
          {/* Dispatched */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="20"
            strokeDasharray={`${(dispatchedPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={-dispatchedOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm">
            Pending: {data.pending} ({pendingPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">
            Completed: {data.completed} ({completedPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span className="text-sm">
            Dispatched: {data.dispatched} ({dispatchedPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
