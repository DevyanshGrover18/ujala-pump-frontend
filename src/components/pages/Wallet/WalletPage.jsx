import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import ReapplyIncentiveModal from './components/ReapplyIncentiveModal';
import {
  IndianRupee,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  ChevronDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  ShieldAlert,
  CreditCard,
  Building2,
  QrCode,
  ArrowUpRight,
  X,
  Eye,
  FileCheck,
  RotateCcw,
  TrendingUp,
  Wallet,
  Send,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  'Approval Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  Incomplete: 'bg-gray-100 text-gray-600 border border-gray-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const STATUS_ICON = {
  'Approval Pending': Clock,
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Incomplete: AlertCircle,
};

const PER_PAGE = 12;

export default function WalletPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'payouts'
  const [data, setData] = useState({
    sellerType: '',
    sellerName: '',
    claims: [],
    wallet: { incentive: 0, points: 0 },
    stats: { pendingIncentive: 0, pendingPoints: 0, totalClaims: 0 },
    eligibleForIncentive: true,
    eligibleForPoints: true,
  });
  const [savedPayoutDetails, setSavedPayoutDetails] = useState(null);
  const [payoutsHistory, setPayoutsHistory] = useState([]);
  const [thresholds, setThresholds] = useState({
    distributorMinPayout: 500,
    dealerMinPayout: 500,
    subDealerMinPayout: 500,
    plumberMinPayout: 200,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});

  // Modals
  const [selectedPayoutDetail, setSelectedPayoutDetail] = useState(null);
  const [showReapplyIncentiveModal, setShowReapplyIncentiveModal] =
    useState(false);
  const [selectedIncentiveToReapply, setSelectedIncentiveToReapply] =
    useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [claimsRes, payoutsRes, thresholdsRes] = await Promise.all([
        axios.get(`${API}/api/incentives/my/claims`, { headers }),
        axios
          .get(`${API}/api/payouts/my`, { headers })
          .catch(() => ({ data: { payouts: [] } })),
        axios
          .get(`${API}/api/payouts/thresholds`, { headers })
          .catch(() => ({ data: null })),
      ]);

      setData(claimsRes.data);
      const fetchedPayouts = Array.isArray(payoutsRes.data)
        ? payoutsRes.data
        : payoutsRes.data?.payouts || [];
      setPayoutsHistory(fetchedPayouts);

      const savedDetails =
        payoutsRes.data?.savedPayoutDetails ||
        claimsRes.data?.savedPayoutDetails ||
        null;
      if (savedDetails) {
        setSavedPayoutDetails(savedDetails);
      }

      if (thresholdsRes.data) setThresholds(thresholdsRes.data);
    } catch (err) {
      console.error('Error fetching wallet claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPlumber = user?.role === 'plumber' || data.sellerType === 'Plumber';
  const showIncentive = data.eligibleForIncentive !== false;
  // const showPoints = !isPlumber && data.eligibleForPoints !== false;
  const showPoints = false; // Points system commented out

  // Minimum threshold for current role
  let roleMinThreshold = 500;
  if (data.sellerType === 'Distributor')
    roleMinThreshold = thresholds.distributorMinPayout;
  else if (data.sellerType === 'Dealer')
    roleMinThreshold = thresholds.dealerMinPayout;
  else if (data.sellerType === 'SubDealer')
    roleMinThreshold = thresholds.subDealerMinPayout;
  else if (isPlumber) roleMinThreshold = thresholds.plumberMinPayout;

  const currentWalletBalance = Number(data.wallet?.incentive || 0);

  // Filter items
  const activeItems =
    activeTab === 'claims' ? data.claims || [] : payoutsHistory || [];
  const filteredItems = activeItems.filter((item) => {
    if (statusFilter !== 'All') {
      if (activeTab === 'claims') {
        const itemStatus =
          item.status === 'Approval Pending' ? 'Pending' : item.status;
        if (itemStatus !== statusFilter) return false;
      } else {
        if (item.status !== statusFilter) return false;
      }
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      if (activeTab === 'claims') {
        const serials =
          item.items?.map((i) => i.serialNumber).join(' ') ||
          item.serialNumber ||
          '';
        const model = item.modelName || item.model?.name || '';
        return (
          serials.toLowerCase().includes(term) ||
          model.toLowerCase().includes(term)
        );
      } else {
        const ref = item.referenceId || '';
        const upi = item.upiId || '';
        const acc = item.bankDetails?.accountNumber || '';
        return (
          ref.toLowerCase().includes(term) ||
          upi.toLowerCase().includes(term) ||
          acc.toLowerCase().includes(term)
        );
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  // Status counts
  const counts = {
    claimsAll: data.claims?.length || 0,
    claimsPending:
      data.claims?.filter(
        (c) => c.status === 'Approval Pending' || c.status === 'Pending'
      ).length || 0,
    claimsApproved:
      data.claims?.filter((c) => c.status === 'Approved').length || 0,
    claimsRejected:
      data.claims?.filter((c) => c.status === 'Rejected').length || 0,
    payoutsAll: payoutsHistory?.length || 0,
    payoutsPending:
      payoutsHistory?.filter((p) => p.status === 'Pending').length || 0,
    payoutsApproved:
      payoutsHistory?.filter((p) => p.status === 'Approved').length || 0,
    payoutsRejected:
      payoutsHistory?.filter((p) => p.status === 'Rejected').length || 0,
  };

  const kpiCards = [];

  if (showIncentive) {
    kpiCards.push({
      title: 'Wallet Balance',
      count: `₹${currentWalletBalance.toLocaleString('en-IN')}`,
      subtitle:
        typeof data.stats?.pendingIncentive === 'number' &&
        data.stats.pendingIncentive > 0
          ? `+ ₹${data.stats.pendingIncentive.toLocaleString('en-IN')} pending approval`
          : 'Ready for withdrawal',
      icon: <IndianRupee className="w-5 h-5" />,
      bg: '#059669', // Emerald
    });
  }

  /* Points system commented out
  if (showPoints) {
    kpiCards.push({
      title: 'Points Earned',
      count: `${(data.wallet?.points ?? 0).toLocaleString('en-IN')} pts`,
      subtitle:
        typeof data.stats?.pendingPoints === 'number' && data.stats.pendingPoints > 0
          ? `+ ${data.stats.pendingPoints.toLocaleString('en-IN')} pts pending`
          : 'Verified Points',
      icon: <Star className="w-5 h-5" />,
      bg: '#F59E0B', // Amber
    });
  }
  */

  kpiCards.push({
    title: 'Pending Claims',
    count: counts.claimsPending,
    subtitle: 'Awaiting admin review',
    icon: <Clock className="w-5 h-5" />,
    bg: '#FB923C', // Orange
  });

  kpiCards.push({
    title: 'Paid Claims',
    count: counts.claimsApproved,
    subtitle: 'Successfully paid',
    icon: <CheckCircle2 className="w-5 h-5" />,
    bg: '#7C3AED', // Purple
  });

  kpiCards.push({
    title: 'Total Claims',
    count: counts.claimsAll,
    subtitle: `${counts.claimsRejected} rejected`,
    icon: <TrendingUp className="w-5 h-5" />,
    bg: '#0EA5E9', // Sky Blue
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-[#7C3AED]" />
            <span>My Wallet</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your earned incentives, claims history, and payout
            disbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ineligibility notice banner if rewards are disabled */}
      {!showIncentive && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Incentives Program Status</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your account is currently not configured to receive cash
              incentives.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards in Dashboard format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102 flex flex-col justify-between"
            style={{ background: card.bg }}
          >
            <div>
              <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                <span style={{ color: card.bg }}>{card.icon}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white/90">
                {card.title}
              </h3>
              {loading ? (
                <div className="animate-pulse bg-white/20 h-8 w-24 rounded-md"></div>
              ) : (
                <p className="text-2xl sm:text-2xl font-bold">{card.count}</p>
              )}
            </div>
            {card.subtitle && (
              <p className="text-xs text-white/80 mt-2 font-medium">
                {card.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Section Switcher Tabs: Claims History vs Payout History */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => {
            setActiveTab('claims');
            setStatusFilter('All');
            setPage(1);
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Reward Claims History</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-semibold">
            {counts.claimsAll}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('payouts');
            setStatusFilter('All');
            setPage(1);
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payout Requests History</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-semibold">
            {counts.payoutsAll}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'claims'
                  ? 'Search serial number, model...'
                  : 'Search reference ID, UPI, A/C...'
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 overflow-x-auto">
            {[
              {
                id: 'All',
                label: 'All',
                count:
                  activeTab === 'claims' ? counts.claimsAll : counts.payoutsAll,
              },
              {
                id: activeTab === 'claims' ? 'Approval Pending' : 'Pending',
                label: 'Pending',
                count:
                  activeTab === 'claims'
                    ? counts.claimsPending
                    : counts.payoutsPending,
              },
              {
                id: 'Approved',
                label: activeTab === 'claims' ? 'Approved' : 'Paid',
                count:
                  activeTab === 'claims'
                    ? counts.claimsApproved
                    : counts.payoutsApproved,
              },
              {
                id: 'Rejected',
                label: 'Rejected',
                count:
                  activeTab === 'claims'
                    ? counts.claimsRejected
                    : counts.payoutsRejected,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.id
                      ? 'bg-purple-100 text-purple-700 font-black'
                      : 'bg-gray-200/70 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-purple-600"></div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Loading...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-16 px-4 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20 text-purple-600" />
            <p className="text-sm font-bold text-gray-600">
              {activeTab === 'claims'
                ? 'No claim records found'
                : 'No payout requests found'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'claims'
                ? 'Claims will automatically appear here when sales or installations are registered'
                : 'Raise a payout request when your balance reaches the minimum threshold'}
            </p>
          </div>
        ) : activeTab === 'claims' ? (
          /* Claims Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Product / Item</th>
                  {showIncentive && (
                    <th className="py-3.5 px-5 text-right">Incentive</th>
                  )}
                  {showPoints && (
                    <th className="py-3.5 px-5 text-right">Points</th>
                  )}
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5">Details</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {paginatedItems.map((claim) => {
                  const key = claim.saleGroupId || claim._id;
                  const isExpanded = !!expanded[key];
                  const rep = claim.items?.[0] || {};
                  const itemCount = claim.items?.length || 1;
                  const StatusIcon = STATUS_ICON[claim.status] || Clock;

                  return (
                    <React.Fragment key={claim._id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(claim.claimDate).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          {itemCount > 1 ? (
                            <button
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [key]: !isExpanded,
                                }))
                              }
                              className="flex items-center gap-2 group text-left"
                            >
                              <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors flex items-center gap-1 text-xs sm:text-sm">
                                  Batch Sale ({itemCount} items)
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </span>
                                <span className="text-[11px] text-gray-400 block font-mono">
                                  {rep.serialNumber} + {itemCount - 1} more
                                </span>
                              </div>
                            </button>
                          ) : (
                            <div>
                              <span className="font-mono text-xs font-bold text-purple-700 block">
                                {rep.serialNumber ||
                                  claim.serialNumber ||
                                  'N/A'}
                              </span>
                              <span className="text-xs text-gray-500 font-medium block mt-0.5">
                                {rep.model?.name ||
                                  rep.modelName ||
                                  claim.modelName ||
                                  'Standard Product'}
                              </span>
                            </div>
                          )}
                        </td>

                        {showIncentive && (
                          <td className="py-4 px-5 text-right font-black text-gray-900 whitespace-nowrap">
                            {typeof claim.totalIncentive === 'number'
                              ? `₹${claim.totalIncentive.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                        )}

                        {showPoints && (
                          <td className="py-4 px-5 text-right font-semibold text-gray-700 whitespace-nowrap">
                            {typeof claim.totalPoints === 'number'
                              ? `${claim.totalPoints.toLocaleString('en-IN')} pts`
                              : '—'}
                          </td>
                        )}

                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              STATUS_BADGE[claim.status] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {claim.status === 'Approval Pending'
                              ? 'Pending'
                              : claim.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-xs text-gray-500">
                          {claim.status === 'Rejected' &&
                          claim.rejectionReason ? (
                            <span
                              className="text-rose-600 font-medium block max-w-xs truncate"
                              title={claim.rejectionReason}
                            >
                              Reason: {claim.rejectionReason}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              {claim.saleGroupId
                                ? 'Grouped Sale'
                                : 'Direct Claim'}
                            </span>
                          )}
                          {claim.reapplyNotes && (
                            <span
                              className="text-amber-700 text-[11px] block mt-0.5 truncate"
                              title={claim.reapplyNotes}
                            >
                              Note: {claim.reapplyNotes}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          {claim.status === 'Rejected' ? (
                            <button
                              onClick={() => {
                                setSelectedIncentiveToReapply(claim);
                                setShowReapplyIncentiveModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                              title="Reapply for this rejected claim"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reapply</span>
                            </button>
                          ) : claim.reappliedAt &&
                            claim.status === 'Approval Pending' ? (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Re-submitted
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded &&
                        claim.items?.map((item, idx) => (
                          <tr
                            key={idx}
                            className="bg-gray-50/50 text-xs text-gray-600"
                          >
                            <td className="py-2.5 px-5 pl-8 font-mono text-gray-400">
                              #{idx + 1}
                            </td>
                            <td className="py-2.5 px-5">
                              <span className="font-mono font-semibold text-gray-800">
                                {item.serialNumber}
                              </span>
                              <span className="text-gray-400 ml-2 font-medium">
                                ({item.modelName || item.model?.name || 'N/A'})
                              </span>
                            </td>
                            {showIncentive && (
                              <td className="py-2.5 px-5 text-right font-bold text-gray-800">
                                {typeof item.incentiveAmount === 'number'
                                  ? `₹${item.incentiveAmount}`
                                  : '—'}
                              </td>
                            )}
                            {showPoints && (
                              <td className="py-2.5 px-5 text-right font-medium text-gray-700">
                                {typeof item.points === 'number'
                                  ? `${item.points} pts`
                                  : '—'}
                              </td>
                            )}
                            <td colSpan={2} />
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Payouts History Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Request Date</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5">Destination</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5">Payment Details</th>
                  <th className="py-3.5 px-5 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {paginatedItems.map((payout) => {
                  const StatusIcon = STATUS_ICON[payout.status] || Clock;

                  return (
                    <tr
                      key={payout._id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(payout.requestedAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right font-black text-gray-900 whitespace-nowrap">
                        ₹{(payout.amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-5">
                        {payout.payoutMethod === 'UPI' ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-purple-700">
                            <QrCode className="w-3.5 h-3.5 text-purple-500" />
                            <span>{payout.upiId}</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-semibold text-gray-800 block">
                              {payout.bankDetails?.bankName || 'Bank Account'}
                            </span>
                            <span className="font-mono text-gray-400 text-[11px]">
                              A/C: {payout.bankDetails?.accountNumber} &bull;
                              IFSC: {payout.bankDetails?.ifscCode}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[payout.status] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {payout.status === 'Approved'
                            ? 'Paid'
                            : payout.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-xs">
                        {payout.status === 'Approved' && (
                          <div>
                            <span className="font-semibold text-gray-800 block">
                              via {payout.paymentMethod || 'Bank Transfer'}
                            </span>
                            {payout.referenceId && (
                              <span className="font-mono text-gray-400 text-[11px]">
                                Ref: {payout.referenceId}
                              </span>
                            )}
                          </div>
                        )}
                        {payout.status === 'Rejected' && (
                          <span
                            className="text-rose-600 font-medium block max-w-xs truncate text-xs"
                            title={payout.rejectionReason}
                          >
                            Reason: {payout.rejectionReason || 'Rejected'}
                          </span>
                        )}
                        {payout.status === 'Pending' && (
                          <span className="text-amber-600 font-medium text-xs">
                            Under verification
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center">
                        {payout.paymentProofImage ? (
                          <button
                            onClick={() => setSelectedPayoutDetail(payout)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing{' '}
              <span className="font-bold text-gray-700">
                {(page - 1) * PER_PAGE + 1}
              </span>
              –
              <span className="font-bold text-gray-700">
                {Math.min(page * PER_PAGE, activeItems.length)}
              </span>{' '}
              of{' '}
              <span className="font-bold text-gray-700">
                {activeItems.length}
              </span>{' '}
              items
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 border border-gray-200 rounded-xl font-bold text-gray-700 bg-gray-50">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reapply Incentive Modal */}
      {showReapplyIncentiveModal && (
        <ReapplyIncentiveModal
          claim={selectedIncentiveToReapply}
          onClose={() => {
            setShowReapplyIncentiveModal(false);
            setSelectedIncentiveToReapply(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {/* Proof Image Viewer Modal */}
      {selectedPayoutDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Payment Receipt Proof
                </h3>
                <p className="text-xs text-gray-500">
                  ₹{selectedPayoutDetail.amount?.toLocaleString('en-IN')} paid
                  via {selectedPayoutDetail.paymentMethod}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayoutDetail(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <img
                src={selectedPayoutDetail.paymentProofImage}
                alt="Receipt"
                className="w-full h-auto max-h-96 object-contain rounded-xl border border-gray-100"
              />
              {selectedPayoutDetail.referenceId && (
                <div className="mt-3 text-xs text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded-lg w-full text-center">
                  Reference:{' '}
                  <span className="font-bold text-gray-900">
                    {selectedPayoutDetail.referenceId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
