import { useState, useEffect } from 'react';
import { Truck, Users, UserCheck, ShoppingBag, Package, FileText, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function ExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/dashboard/executive`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5]"></div>
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    {
      title: 'Assigned Distributors',
      count: data.counts?.distributors || 0,
      icon: <Truck className="w-5 h-5" />,
      bg: '#8B5CF6',
    },
    {
      title: 'Assigned Dealers',
      count: data.counts?.dealers || 0,
      icon: <Users className="w-5 h-5" />,
      bg: '#F59E0B',
    },
    {
      title: 'Assigned Sub Dealers',
      count: data.counts?.subDealers || 0,
      icon: <Users className="w-5 h-5" />,
      bg: '#10B981',
    },
    {
      title: 'Total Customers',
      count: data.counts?.customers || 0,
      icon: <UserCheck className="w-5 h-5" />,
      bg: '#EC4899',
    },
    {
      title: 'Total Sales Count',
      count: data.counts?.sales || 0,
      icon: <ShoppingBag className="w-5 h-5" />,
      bg: '#3B82F6',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Executive Dashboard
        </h1>
        <p className="text-sm text-gray-500">Real-time performance and inventory tracking for your assigned hierarchy.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102"
            style={{ background: card.bg }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                  <span style={{ color: card.bg }}>{card.icon}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1 text-white/90">
                  {card.title}
                </h3>
                <p className="text-2xl sm:text-2xl font-bold">
                  {card.count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#4d55f5]" />
              Inventory Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Distributor Stock</span>
                <span className="text-base font-bold text-gray-800">{data.inventorySummary?.distributors || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Dealer Stock</span>
                <span className="text-base font-bold text-gray-800">{data.inventorySummary?.dealers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Sub Dealer Stock</span>
                <span className="text-base font-bold text-gray-800">{data.inventorySummary?.subDealers || 0}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Total System Stock</span>
            <span className="text-2xl font-extrabold text-[#4d55f5]">{data.inventorySummary?.total || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Low Stock Models (Distributor)
          </h2>
          {data.lowStockProducts?.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              All models have healthy stock levels.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Model Name</th>
                    <th className="px-4 py-3">Model Code</th>
                    <th className="px-4 py-3 text-right">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {data.lowStockProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-4 py-3">{p.code}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded text-xs">
                          {p.stock} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-500" />
            Recent Production Orders
          </h2>
          {data.recentOrders?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No recent orders found.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((o, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Order #{o.orderId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.model?.name} ({o.category?.name})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{o.totalUnits} units</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      o.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-green-500" />
            Recent Customer Purchases
          </h2>
          {data.recentCustomerActivity?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No recent customer activity.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentCustomerActivity.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{s.customerName}</p>
                      <p className="text-xs text-gray-400">{s.customerPhone}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(s.saleDate || s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-dashed border-gray-200 pt-1.5">
                    <span className="text-gray-500 font-medium">Serial: <span className="text-gray-700 font-bold">{s.product?.serialNumber}</span></span>
                    <span className="text-gray-500 font-medium">Sold By: <span className="text-gray-700 font-bold">
                      {s.subDealer?.name || s.dealer?.name || s.distributor?.name}
                    </span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}
