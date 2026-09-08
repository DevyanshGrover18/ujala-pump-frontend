import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  CreditCard,
  Clock,
  IndianRupee,
  Gift,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Package,
  Layers,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function AccountsDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts' | 'incentives' | 'sales'

  // Data states
  const [payoutData, setPayoutData] = useState({
    payouts: [],
    stats: {
      totalCount: 0,
      totalRequestedAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      rejectedCount: 0,
    },
  });

  const [incentiveGroups, setIncentiveGroups] = useState([]);
  const [assignedProducts, setAssignedProducts] = useState([]);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [payoutsRes, incentivesRes, salesRes] = await Promise.allSettled([
        axios.get(`${API}/api/payouts`, { headers }),
        axios.get(`${API}/api/incentives`, { headers }),
        axios.get(`${API}/api/sales/assigned-products`, { headers }),
      ]);

      if (payoutsRes.status === 'fulfilled' && payoutsRes.value?.data) {
        setPayoutData({
          payouts: payoutsRes.value.data.payouts || [],
          stats: payoutsRes.value.data.stats || {
            totalCount: 0,
            totalRequestedAmount: 0,
            pendingCount: 0,
            pendingAmount: 0,
            approvedCount: 0,
            approvedAmount: 0,
            rejectedCount: 0,
          },
        });
      }

      if (incentivesRes.status === 'fulfilled' && incentivesRes.value?.data) {
        setIncentiveGroups(Array.isArray(incentivesRes.value.data) ? incentivesRes.value.data : []);
      }

      if (salesRes.status === 'fulfilled' && salesRes.value?.data) {
        setAssignedProducts(Array.isArray(salesRes.value.data) ? salesRes.value.data : []);
      }
    } catch (err) {
      console.error('Error fetching accounts dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Incentive Computed Metrics
  const incentiveMetrics = useMemo(() => {
    let totalClaims = 0;
    let totalIncentiveAmount = 0;
    let totalPoints = 0;

    let pendingCount = 0;
    let pendingAmount = 0;
    let pendingPoints = 0;

    let approvedCount = 0;
    let approvedAmount = 0;
    let approvedPoints = 0;

    let rejectedCount = 0;

    const byRole = {
      Distributor: { count: 0, amount: 0, points: 0 },
      Dealer: { count: 0, amount: 0, points: 0 },
      SubDealer: { count: 0, amount: 0, points: 0 },
      Plumber: { count: 0, amount: 0, points: 0 },
    };

    incentiveGroups.forEach((g) => {
      const itemsCount = g.items?.length || 1;
      totalClaims += itemsCount;
      const inc = Number(g.totalIncentive) || 0;
      const pts = Number(g.totalPoints) || 0;

      totalIncentiveAmount += inc;
      totalPoints += pts;

      const role = g.sellerType || 'Other';
      if (byRole[role]) {
        byRole[role].count += itemsCount;
        byRole[role].amount += inc;
        byRole[role].points += pts;
      }

      if (g.status === 'Approval Pending') {
        pendingCount += itemsCount;
        pendingAmount += inc;
        pendingPoints += pts;
      } else if (g.status === 'Approved') {
        approvedCount += itemsCount;
        approvedAmount += inc;
        approvedPoints += pts;
      } else if (g.status === 'Rejected') {
        rejectedCount += itemsCount;
      }
    });

    return {
      totalGroups: incentiveGroups.length,
      totalClaims,
      totalIncentiveAmount,
      totalPoints,
      pendingCount,
      pendingAmount,
      pendingPoints,
      approvedCount,
      approvedAmount,
      approvedPoints,
      rejectedCount,
      byRole,
    };
  }, [incentiveGroups]);

  // Sales Computed Metrics
  const salesMetrics = useMemo(() => {
    const totalAssigned = assignedProducts.length;
    let customerSold = 0;
    let inChannelStock = 0;
    const modelDistribution = {};
    const channelDistribution = {
      withDistributor: 0,
      withDealer: 0,
      withSubDealer: 0,
      soldToCustomer: 0,
    };

    assignedProducts.forEach((p) => {
      const modelName = p.model?.name || p.model?.code || 'Standard Model';
      modelDistribution[modelName] = (modelDistribution[modelName] || 0) + 1;

      if (p.sale || p.sale?.customerName || p.sold) {
        customerSold += 1;
        channelDistribution.soldToCustomer += 1;
      } else if (p.subDealer) {
        inChannelStock += 1;
        channelDistribution.withSubDealer += 1;
      } else if (p.dealer) {
        inChannelStock += 1;
        channelDistribution.withDealer += 1;
      } else if (p.distributor) {
        inChannelStock += 1;
        channelDistribution.withDistributor += 1;
      }
    });

    const topModels = Object.entries(modelDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalAssigned,
      customerSold,
      inChannelStock,
      topModels,
      channelDistribution,
    };
  }, [assignedProducts]);

  // Priority Lists
  const pendingPayoutsList = useMemo(() => {
    return payoutData.payouts
      .filter((p) => p.status === 'Pending')
      .slice(0, 6);
  }, [payoutData.payouts]);

  const pendingIncentivesList = useMemo(() => {
    return incentiveGroups
      .filter((g) => g.status === 'Approval Pending')
      .slice(0, 6);
  }, [incentiveGroups]);

  const recentSalesList = useMemo(() => {
    return assignedProducts.slice(0, 6);
  }, [assignedProducts]);

  // KPI Cards conforming to the exact DNA of the app's dashboards
  const cardData = [
    {
      title: 'Disbursed Payouts',
      count: `₹${payoutData.stats.approvedAmount.toLocaleString('en-IN')}`,
      subtitle: `${payoutData.stats.approvedCount} approved payouts`,
      icon: <IndianRupee className="w-5 h-5" />,
      bg: '#10B981', // Green
      path: '/accounts-panel/payouts',
    },
    {
      title: 'Pending Payouts',
      count: `₹${payoutData.stats.pendingAmount.toLocaleString('en-IN')}`,
      subtitle: `${payoutData.stats.pendingCount} requests to process`,
      icon: <Clock className="w-5 h-5" />,
      bg: '#FB923C', // Orange
      path: '/accounts-panel/payouts',
    },
    {
      title: 'Total Payout Requests',
      count: payoutData.stats.totalCount,
      subtitle: `₹${payoutData.stats.totalRequestedAmount.toLocaleString('en-IN')} requested`,
      icon: <CreditCard className="w-5 h-5" />,
      bg: '#7C3AED', // Purple
      path: '/accounts-panel/payouts',
    },
    {
      title: 'Total Incentives',
      count: `₹${incentiveMetrics.totalIncentiveAmount.toLocaleString('en-IN')}`,
      subtitle: `${incentiveMetrics.totalClaims} claims processed`,
      /* subtitle: `${incentiveMetrics.totalClaims} claims (${incentiveMetrics.totalPoints.toLocaleString('en-IN')} pts)`, */
      icon: <Gift className="w-5 h-5" />,
      bg: '#0EA5E9', // Sky Blue
      path: '/accounts-panel/incentives',
    },
    {
      title: 'Pending Incentives',
      count: `₹${incentiveMetrics.pendingAmount.toLocaleString('en-IN')}`,
      subtitle: `${incentiveMetrics.pendingCount} claims awaiting approval`,
      icon: <AlertCircle className="w-5 h-5" />,
      bg: '#F59E0B', // Amber
      path: '/accounts-panel/incentives',
    },
    {
      title: 'Sales & Dispatches',
      count: `${salesMetrics.totalAssigned} units`,
      subtitle: `${salesMetrics.customerSold} sold to customers`,
      icon: <ShoppingCart className="w-5 h-5" />,
      bg: '#EC4899', // Pink
      path: '/accounts-panel/sales',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Accounts Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time financial tracking for payouts, incentives, and sales.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* ── KPI Cards Grid (Matches other panels' DNA) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cardData.map((card, index) => (
          <Link to={card.path} key={index}>
            <div
              className="rounded-xl shadow-card p-4 sm:p-5 text-white transition-transform hover:scale-102 flex flex-col justify-between h-full"
              style={{ background: card.bg }}
            >
              <div>
                <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                  <span style={{ color: card.bg }}>{card.icon}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold mb-1 text-white/90">
                  {card.title}
                </h3>
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-7 w-20 rounded-md"></div>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">
                    {card.count}
                  </p>
                )}
                {card.subtitle && (
                  <p className="text-[11px] text-white/80 mt-1.5 font-medium leading-tight line-clamp-2">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Secondary Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incentives by Role */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#0EA5E9]" />
                Incentive Claims by Role
              </h2>
              <span className="text-xs text-gray-400 font-medium">Claims Value</span>
            </div>

            <div className="space-y-4">
              {[
                { role: 'Distributor', label: 'Distributors', color: 'bg-purple-500' },
                { role: 'Dealer', label: 'Dealers', color: 'bg-amber-500' },
                { role: 'SubDealer', label: 'Sub Dealers', color: 'bg-blue-500' },
                { role: 'Plumber', label: 'Plumbers', color: 'bg-emerald-500' },
              ].map(({ role, label, color }) => {
                const data = incentiveMetrics.byRole[role] || { count: 0, amount: 0, points: 0 };
                const pct = incentiveMetrics.totalIncentiveAmount > 0
                  ? Math.round((data.amount / incentiveMetrics.totalIncentiveAmount) * 100)
                  : 0;

                return (
                  <div key={role} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        {label}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-gray-900">
                          ₹{data.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{data.count} items</span>
                      {/* <span>{data.points.toLocaleString('en-IN')} pts</span> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Total Claims Volume:</span>
            <span className="text-sm font-bold text-[#0EA5E9]">
              {incentiveMetrics.totalClaims} claims
            </span>
            {/* <span className="text-gray-600 font-medium">Total Points:</span>
            <span className="text-sm font-bold text-[#0EA5E9]">
              {incentiveMetrics.totalPoints.toLocaleString('en-IN')} pts
            </span> */}
          </div>

        </div>

        {/* Top Dispatched Models */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#EC4899]" />
                Top Dispatched Models
              </h2>
              <span className="text-xs text-gray-400 font-medium">Volume</span>
            </div>

            {salesMetrics.topModels.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No dispatch data available yet
              </div>
            ) : (
              <div className="space-y-3">
                {salesMetrics.topModels.map((m, idx) => {
                  const pct = salesMetrics.totalAssigned > 0
                    ? Math.round((m.count / salesMetrics.totalAssigned) * 100)
                    : 0;
                  return (
                    <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800 truncate max-w-[180px]" title={m.name}>
                          {m.name}
                        </span>
                        <span className="font-mono font-bold text-[#EC4899]">
                          {m.count} <span className="text-[10px] font-normal text-gray-500">units</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#EC4899] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Total Serialized Units:</span>
            <span className="text-sm font-bold text-[#EC4899]">
              {salesMetrics.totalAssigned} units
            </span>
          </div>
        </div>

        {/* Network Stock Pipeline */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#10B981]" />
                Channel Inventory Flow
              </h2>
              <span className="text-xs text-gray-400 font-medium">Stage Counts</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-gray-800 block">Distributor Hub</span>
                  <span className="text-[10px] text-gray-500">Stock ready for dealers</span>
                </div>
                <span className="text-base font-bold text-gray-800 font-mono">
                  {salesMetrics.channelDistribution.withDistributor}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-gray-800 block">Dealer Counters</span>
                  <span className="text-[10px] text-gray-500">Ready for sub-dealers / sales</span>
                </div>
                <span className="text-base font-bold text-gray-800 font-mono">
                  {salesMetrics.channelDistribution.withDealer}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-gray-800 block">Sub Dealer Outlets</span>
                  <span className="text-[10px] text-gray-500">Direct retail point</span>
                </div>
                <span className="text-base font-bold text-gray-800 font-mono">
                  {salesMetrics.channelDistribution.withSubDealer}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Sold to Customers</span>
                  <span className="text-[10px] text-emerald-700">Warranties activated</span>
                </div>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {salesMetrics.channelDistribution.soldToCustomer}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Customer Conversion:</span>
            <span className="text-sm font-bold text-[#10B981]">
              {salesMetrics.totalAssigned > 0
                ? `${Math.round((salesMetrics.customerSold / salesMetrics.totalAssigned) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Table Card (Matching Admin/Executive panels DNA) ── */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Action Items & Activity
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and process pending payout requests, incentive verifications, and recent sales.
            </p>
          </div>

          {/* Pill Tabs */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'payouts'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Pending Payouts</span>
              {payoutData.stats.pendingCount > 0 && (
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {payoutData.stats.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('incentives')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'incentives'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>Pending Incentives</span>
              {incentiveMetrics.pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {incentiveMetrics.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sales'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>Recent Sales</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Pending Payouts Table */}
        {activeTab === 'payouts' && (
          <div>
            {pendingPayoutsList.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-semibold text-gray-800">All Payout Requests Processed</p>
                <p className="text-xs text-gray-400 mt-0.5">No pending requests awaiting approval.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Requester</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Requested Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pendingPayoutsList.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <div>{p.requesterName || 'Unnamed'}</div>
                          <div className="text-xs text-gray-400 font-normal">{p.requesterPhone || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                            {p.requesterType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 font-mono">
                          ₹{p.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.payoutMethod === 'UPI' ? 'UPI Transfer' : 'Bank Transfer'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/accounts-panel/payouts"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#7C3AED] hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            Process
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {payoutData.stats.pendingCount} pending payout request(s) total
              </span>
              <Link
                to="/accounts-panel/payouts"
                className="font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                Go to Payouts Console
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Incentives Table */}
        {activeTab === 'incentives' && (
          <div>
            {pendingIncentivesList.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-semibold text-gray-800">All Incentive Claims Cleared</p>
                <p className="text-xs text-gray-400 mt-0.5">No pending claims waiting for review.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Claimant</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Items Count</th>
                      <th className="px-4 py-3">Incentive (₹)</th>
                      {/* <th className="px-4 py-3">Points</th> */}
                      <th className="px-4 py-3">Claim Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pendingIncentivesList.map((g) => (
                      <tr key={g._id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {g.sellerName || 'Unnamed Claimant'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                            {g.sellerType || 'Seller'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {g.items?.length || 1} product(s)
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 font-mono">
                          ₹{(Number(g.totalIncentive) || 0).toLocaleString('en-IN')}
                        </td>
                        {/* <td className="px-4 py-3 font-semibold text-amber-600 font-mono">
                          {(Number(g.totalPoints) || 0).toLocaleString('en-IN')} pts
                        </td> */}
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {g.claimDate ? new Date(g.claimDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/accounts-panel/incentives"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            Verify
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {incentiveMetrics.pendingCount} pending incentive claim(s) total
              </span>
              <Link
                to="/accounts-panel/incentives"
                className="font-bold text-[#F59E0B] hover:underline flex items-center gap-1"
              >
                Go to Incentive Claims
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Recent Sales Table */}
        {activeTab === 'sales' && (
          <div>
            {recentSalesList.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No recent sales or dispatches recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Assigned Distributor</th>
                      <th className="px-4 py-3">Dealer / SubDealer</th>
                      <th className="px-4 py-3">Customer Status</th>
                      <th className="px-4 py-3 text-right">Dispatch Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {recentSalesList.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {item.serialNumber || '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.model?.name || item.model?.code || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.distributor?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.subDealer?.name || item.dealer?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {item.sale?.customerName || item.sold ? (
                            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                              Sold to Customer
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                              In Channel
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          {item.assignedToDistributorAt || item.createdAt
                            ? new Date(item.assignedToDistributorAt || item.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {salesMetrics.totalAssigned} total units monitored
              </span>
              <Link
                to="/accounts-panel/sales"
                className="font-bold text-[#EC4899] hover:underline flex items-center gap-1"
              >
                Go to Full Sales Ledger
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
