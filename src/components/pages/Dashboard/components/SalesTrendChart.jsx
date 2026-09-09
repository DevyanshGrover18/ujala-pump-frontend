import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-gray-800">
        <p className="font-bold text-gray-300 border-b border-gray-700 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-400 font-medium">Units Sold:</span>
          <span className="font-bold text-white">{payload[0]?.value?.toLocaleString('en-IN')} units</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-indigo-400 font-medium">Revenue:</span>
          <span className="font-bold text-emerald-400">
            ₹{payload[1]?.payload?.revenue?.toLocaleString('en-IN') || 0}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesTrendChart() {
  const [period, setPeriod] = useState('6months');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/sales-trend?period=${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error('Error fetching sales trend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [period]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Sales Trend</h3>
          <p className="text-xs text-gray-400">Units Sold vs Revenue Performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:outline-hidden cursor-pointer"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d55f5]"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No sales data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#818cf8' }}
                axisLine={false}
                tickLine={false}
                unit="L"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                yAxisId="left"
                name="Units Sold"
                dataKey="unitsSold"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                yAxisId="right"
                name="Revenue (₹ Lakhs)"
                dataKey="revenueLakhs"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
