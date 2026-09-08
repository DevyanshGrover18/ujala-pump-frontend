import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldAlert,
  Search,
  Package,
  ArrowUpRight,
  Building2,
  QrCode,
  X,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import ReapplyIncentiveModal from '../Wallet/components/ReapplyIncentiveModal';


const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  'Approval Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  Incomplete: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const STATUS_ICON = {
  'Approval Pending': Clock,
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Incomplete: AlertCircle,
};

const PER_PAGE = 10;

export default function PlumberWallet() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'payouts'
  const [data, setData] = useState({
    claims: [],
    wallet: { incentive: 0, points: 0 },
    stats: { pendingIncentive: 0, totalClaims: 0 },
    eligibleForIncentive: true,
  });
  const [savedPayoutDetails, setSavedPayoutDetails] = useState(null);
  const [payoutsHistory, setPayoutsHistory] = useState([]);
  const [thresholds, setThresholds] = useState({ plumberMinPayout: 200 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showRequestPayoutModal, setShowRequestPayoutModal] = useState(false);
  const [reapplyPayoutData, setReapplyPayoutData] = useState(null);
  const [selectedPayoutDetail, setSelectedPayoutDetail] = useState(null);
  const [showReapplyIncentiveModal, setShowReapplyIncentiveModal] = useState(false);
  const [selectedIncentiveToReapply, setSelectedIncentiveToReapply] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [claimsRes, payoutsRes, thresholdsRes] = await Promise.all([
        axios.get(`${API}/api/incentives/my/claims`, { headers }),
        axios.get(`${API}/api/payouts/my`, { headers }).catch(() => ({ data: { payouts: [] } })),
        axios.get(`${API}/api/payouts/thresholds`, { headers }).catch(() => ({ data: null })),
      ]);

      setData(claimsRes.data);
      const fetchedPayouts = Array.isArray(payoutsRes.data)
        ? payoutsRes.data
        : payoutsRes.data?.payouts || [];
      setPayoutsHistory(fetchedPayouts);

      const savedDetails =
        payoutsRes.data?.savedPayoutDetails || claimsRes.data?.savedPayoutDetails || null;
      if (savedDetails) {
        setSavedPayoutDetails(savedDetails);
      }

      if (thresholdsRes.data) setThresholds(thresholdsRes.data);
    } catch (err) {
      console.error('Error fetching plumber wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showIncentive = data.eligibleForIncentive !== false;
  const minThreshold = thresholds.plumberMinPayout || 200;
  const currentWalletBalance = data.wallet?.incentive ?? 0;

  // Filter items
  const activeItems = activeTab === 'installations' ? data.claims : payoutsHistory;
  const filteredItems = activeItems.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const term = search.toLowerCase().trim();
    if (!term) return matchesStatus;

    if (activeTab === 'installations') {
      return (
        matchesStatus &&
        (item.serialNumber?.toLowerCase().includes(term) ||
          item.modelName?.toLowerCase().includes(term) ||
          item.customerName?.toLowerCase().includes(term) ||
          item.customerPhone?.toLowerCase().includes(term) ||
          item.rejectionReason?.toLowerCase().includes(term))
      );
    } else {
      return (
        matchesStatus &&
        (item.referenceId?.toLowerCase().includes(term) ||
          item.upiId?.toLowerCase().includes(term) ||
          item.bankDetails?.accountNumber?.toLowerCase().includes(term) ||
          item.rejectionReason?.toLowerCase().includes(term))
      );
    }
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  const paginatedItems = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Status counts
  const counts = {
    installationsAll: data.claims.length,
    installationsPending: data.claims.filter((c) => c.status === 'Approval Pending').length,
    installationsApproved: data.claims.filter((c) => c.status === 'Approved').length,
    installationsRejected: data.claims.filter((c) => c.status === 'Rejected').length,

    payoutsAll: payoutsHistory.length,
    payoutsPending: payoutsHistory.filter((p) => p.status === 'Pending').length,
    payoutsApproved: payoutsHistory.filter((p) => p.status === 'Approved').length,
    payoutsRejected: payoutsHistory.filter((p) => p.status === 'Rejected').length,
  };

  // KPI cards
  const kpiCards = [
    {
      title: 'Wallet Balance',
      count: `₹${currentWalletBalance.toLocaleString('en-IN')}`,
      subtitle:
        typeof data.stats?.pendingIncentive === 'number' && data.stats.pendingIncentive > 0
          ? `+ ₹${data.stats.pendingIncentive.toLocaleString('en-IN')} pending`
          : 'Ready for withdrawal',
      icon: <IndianRupee className="w-5 h-5" />,
      bg: '#059669', // Emerald
    },
    {
      title: 'Pending Verifications',
      count: counts.installationsPending,
      subtitle: 'Awaiting admin approval',
      icon: <Clock className="w-5 h-5" />,
      bg: '#FB923C', // Orange
    },
    {
      title: 'Paid Installations',
      count: counts.installationsApproved,
      subtitle: `Out of ${counts.installationsAll} total claims`,
      icon: <CheckCircle2 className="w-5 h-5" />,
      bg: '#7C3AED', // Purple
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Plumber Wallet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.username || 'Plumber'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track your installation incentive earnings and request payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showIncentive && (
            <button
              onClick={() => {
                setReapplyPayoutData(null);
                setShowRequestPayoutModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ineligible notice if incentive is disabled */}
      {!showIncentive && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Incentive Status Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your account is currently not configured to receive installation incentives.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards in Dashboard format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {/* Section Switcher Tabs */}
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
          <span>Installation Claims</span>
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
          <span>Payout Requests</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-semibold">
            {counts.payoutsAll}
          </span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

          {/* Status Filters */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto">
            {[
              {
                id: 'All',
                label: 'All',
                count: activeTab === 'claims' ? counts.claimsAll : counts.payoutsAll,
              },
              {
                id: activeTab === 'claims' ? 'Approval Pending' : 'Pending',
                label: 'Pending',
                count: activeTab === 'claims' ? counts.claimsPending : counts.payoutsPending,
              },
              {
                id: 'Approved',
                label: 'Paid',
                count: activeTab === 'claims' ? counts.claimsApproved : counts.payoutsApproved,
              },
              {
                id: 'Rejected',
                label: 'Rejected',
                count: activeTab === 'claims' ? counts.claimsRejected : counts.payoutsRejected,
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
                    : 'text-gray-500 hover:text-gray-700'
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b189b]"></div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Loading...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#5b189b]" />
            <p className="text-sm font-bold text-gray-600">
              {activeTab === 'claims' ? 'No installation claims found.' : 'No payout requests found.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'claims'
                ? 'Claims appear here after you register motor installations.'
                : 'Submit a payout request to withdraw your incentives.'}
            </p>
          </div>
        ) : activeTab === 'claims' ? (
          /* Installation Claims Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Serial Number</th>
                  <th className="py-3.5 px-5">Model Code/Name</th>
                  <th className="py-3.5 px-5">Claim Date</th>
                  {showIncentive && <th className="py-3.5 px-5 text-right">Incentive</th>}
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {paginated.map((claim) => {
                  const representativeItem = claim.items?.[0] || {};
                  const StatusIcon = STATUS_ICON[claim.status] || Clock;

                  return (
                    <tr key={claim._id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-5 font-mono font-bold text-purple-700">
                        {representativeItem.serialNumber || claim.serialNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-gray-800 block text-xs sm:text-sm">
                          {representativeItem.model?.code || claim.modelName || 'N/A'}
                        </span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {representativeItem.model?.name || claim.modelName || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(claim.claimDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      {showIncentive && (
                        <td className="py-4 px-5 text-right font-black text-gray-900 whitespace-nowrap">
                          {typeof claim.totalIncentive === 'number'
                            ? `₹${claim.totalIncentive.toLocaleString('en-IN')}`
                            : '—'}
                        </td>
                      )}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[claim.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {claim.status === 'Approval Pending' ? 'Pending' : claim.status === 'Approved' ? 'Paid' : claim.status}
                        </span>
                        {claim.status === 'Rejected' && claim.rejectionReason && (
                          <span className="text-[10px] text-rose-500 block mt-1 max-w-[150px] mx-auto truncate" title={claim.rejectionReason}>
                            Reason: {claim.rejectionReason}
                          </span>
                        )}
                        {claim.reapplyNotes && (
                          <span className="text-[10px] text-amber-700 block mt-0.5 max-w-[150px] mx-auto truncate" title={claim.reapplyNotes}>
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
                        ) : claim.reappliedAt && claim.status === 'Approval Pending' ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Re-submitted
                          </span>
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
        ) : (
          /* Payouts Table */
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
                {paginated.map((payout) => {
                  const StatusIcon = STATUS_ICON[payout.status] || Clock;

                  return (
                    <tr key={payout._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(payout.requestedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
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
                              A/C: {payout.bankDetails?.accountNumber} &bull; IFSC: {payout.bankDetails?.ifscCode}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[payout.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {payout.status === 'Approved' ? 'Paid' : payout.status}
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
                          <div className="space-y-1.5">
                            <span className="text-rose-600 font-medium block max-w-xs truncate" title={payout.rejectionReason}>
                              Reason: {payout.rejectionReason || 'Rejected'}
                            </span>
                            <button
                              onClick={() => {
                                setReapplyPayoutData(payout);
                                setShowRequestPayoutModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all hover:scale-105"
                              title="Reapply with corrected details"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reapply</span>
                            </button>
                          </div>
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
          <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Page <span className="font-bold text-gray-700">{page}</span> of{' '}
              <span className="font-bold text-gray-700">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showRequestPayoutModal && (
        <PlumberRequestPayoutModal
          availableBalance={currentWalletBalance}
          minThreshold={minThreshold}
          savedPayoutDetails={savedPayoutDetails}
          reapplyData={reapplyPayoutData}
          onClose={() => {
            setShowRequestPayoutModal(false);
            setReapplyPayoutData(null);
          }}
          onSuccess={() => {
            setShowRequestPayoutModal(false);
            setReapplyPayoutData(null);
            fetchData();
          }}
        />
      )}

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
                <h3 className="text-base font-bold text-gray-900">Payment Receipt Proof</h3>
                <p className="text-xs text-gray-500">
                  ₹{selectedPayoutDetail.amount?.toLocaleString('en-IN')} paid via {selectedPayoutDetail.paymentMethod}
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
                  Reference: <span className="font-bold text-gray-900">{selectedPayoutDetail.referenceId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Plumber Request Payout Modal Component
// -------------------------------------------------------------
function PlumberRequestPayoutModal({ availableBalance, minThreshold, savedPayoutDetails, reapplyData, onClose, onSuccess }) {
  const getInitialDetails = () => {
    if (reapplyData) {
      return {
        payoutMethod: reapplyData.payoutMethod || 'Bank',
        bankDetails: reapplyData.bankDetails || {},
        upiId: reapplyData.upiId || '',
      };
    }
    if (savedPayoutDetails) return savedPayoutDetails;
    try {
      const local = localStorage.getItem('saved_payout_details');
      if (local) return JSON.parse(local);
    } catch (e) {}
    return null;
  };

  const initialDetails = getInitialDetails();
  const [amount, setAmount] = useState(
    reapplyData?.amount ? String(reapplyData.amount) : availableBalance > 0 ? String(availableBalance) : ''
  );
  const [payoutMethod, setPayoutMethod] = useState(initialDetails?.payoutMethod || 'Bank'); // 'Bank' | 'UPI'
  const [bankDetails, setBankDetails] = useState({
    accountNumber: initialDetails?.bankDetails?.accountNumber || '',
    ifscCode: initialDetails?.bankDetails?.ifscCode || '',
    bankName: initialDetails?.bankDetails?.bankName || '',
    accountHolderName: initialDetails?.bankDetails?.accountHolderName || '',
  });
  const [upiId, setUpiId] = useState(initialDetails?.upiId || '');
  const [notes, setNotes] = useState(reapplyData?.notes || '');
  const [saveDetails, setSaveDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!reapplyData && savedPayoutDetails) {
      if (savedPayoutDetails.payoutMethod) {
        setPayoutMethod(savedPayoutDetails.payoutMethod);
      }
      if (savedPayoutDetails.bankDetails) {
        setBankDetails((prev) => ({
          accountNumber: savedPayoutDetails.bankDetails.accountNumber || prev.accountNumber,
          ifscCode: savedPayoutDetails.bankDetails.ifscCode || prev.ifscCode,
          bankName: savedPayoutDetails.bankDetails.bankName || prev.bankName,
          accountHolderName: savedPayoutDetails.bankDetails.accountHolderName || prev.accountHolderName,
        }));
      }
      if (savedPayoutDetails.upiId) {
        setUpiId(savedPayoutDetails.upiId);
      }
    }
  }, [savedPayoutDetails, reapplyData]);

  const numAmount = Number(amount) || 0;
  const isAmountValid = numAmount >= minThreshold && numAmount <= availableBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAmountValid) {
      if (numAmount < minThreshold) {
        return toast.error(`Minimum withdrawal amount is ₹${minThreshold.toLocaleString('en-IN')}`);
      }
      if (numAmount > availableBalance) {
        return toast.error(`Amount exceeds available balance of ₹${availableBalance.toLocaleString('en-IN')}`);
      }
      return;
    }

    if (payoutMethod === 'UPI' && !upiId.trim()) {
      return toast.error('Please enter your UPI ID');
    }

    if (payoutMethod === 'Bank') {
      if (!bankDetails.accountNumber.trim() || !bankDetails.ifscCode.trim() || !bankDetails.accountHolderName.trim()) {
        return toast.error('Please fill all required bank account fields');
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/api/payouts/request`,
        {
          amount: numAmount,
          payoutMethod,
          bankDetails: payoutMethod === 'Bank' ? bankDetails : undefined,
          upiId: payoutMethod === 'UPI' ? upiId.trim() : undefined,
          notes: notes.trim(),
          saveDetails,
          isReapplication: !!reapplyData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (saveDetails) {
        try {
          localStorage.setItem(
            'saved_payout_details',
            JSON.stringify({
              payoutMethod,
              bankDetails: payoutMethod === 'Bank' ? bankDetails : undefined,
              upiId: payoutMethod === 'UPI' ? upiId.trim() : undefined,
            })
          );
        } catch (e) {}
      }

      toast.success(reapplyData ? 'Payout reapplication submitted!' : 'Payout request submitted successfully!');
      window.dispatchEvent(new Event('payouts-updated'));
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${reapplyData ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {reapplyData ? <RefreshCw className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {reapplyData ? 'Reapply for Incentive Payout' : 'Request Incentive Payout'}
              </h2>
              <p className="text-xs text-gray-500">
                {reapplyData
                  ? 'Update your details to re-submit your payout request'
                  : 'Withdraw your earned incentives directly to your account'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Reapply Banner */}
          {reapplyData && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-xs text-amber-900 mb-0.5">Reapplying for Payout</span>
                <span className="text-amber-800 text-[11px] leading-relaxed block">
                  Previous request for <strong>₹{reapplyData.amount?.toLocaleString('en-IN')}</strong> was rejected: <strong className="text-rose-700">{reapplyData.rejectionReason || 'No reason provided'}</strong>. Please review and update your payment details below before resubmitting.
                </span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center text-xs">
            <div>
              <span className="text-gray-400 block font-bold uppercase">Available Balance</span>
              <span className="text-lg font-black text-gray-900">
                ₹{availableBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block font-bold uppercase">Min Threshold</span>
              <span className="font-bold text-purple-700">
                ₹{minThreshold.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Payout Amount (₹) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(availableBalance))}
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                Withdraw Max
              </button>
            </div>
            <input
              type="number"
              min={minThreshold}
              max={availableBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min. ₹${minThreshold}`}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 ${
                amount && !isAmountValid
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-gray-200 focus:ring-purple-500'
              }`}
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Payout Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayoutMethod('Bank')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                  payoutMethod === 'Bank'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank Account</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('UPI')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                  payoutMethod === 'UPI'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI ID / VPA</span>
              </button>
            </div>
          </div>

          {/* Dynamic Details Form */}
          {payoutMethod === 'UPI' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                UPI ID (Virtual Payment Address) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-xl border border-gray-200">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name as per bank passbook"
                  value={bankDetails.accountHolderName}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bank account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={bankDetails.ifscCode}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* User Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Note for Admin (Optional)
            </label>
            <input
              type="text"
              placeholder="Any additional instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Save payment details checkbox */}
          <div className="flex items-center gap-2.5 p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
            <input
              type="checkbox"
              id="plumberSaveDetails"
              checked={saveDetails}
              onChange={(e) => setSaveDetails(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
            />
            <label
              htmlFor="plumberSaveDetails"
              className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
            >
              Save payment details for future payouts
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isAmountValid}
              className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : reapplyData ? 'Submit Reapplication' : 'Submit Payout Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
