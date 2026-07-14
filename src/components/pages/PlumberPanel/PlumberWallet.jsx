import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
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
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  'Approval Pending': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Approved: 'bg-green-50 text-green-700 border border-green-200',
  Rejected: 'bg-red-50 text-red-700 border border-red-200',
  Incomplete: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const STATUS_ICON = {
  'Approval Pending': Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Incomplete: AlertCircle,
};

const PER_PAGE = 10;

export default function PlumberWallet() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    claims: [],
    wallet: { incentive: 0, points: 0 },
    eligibleForIncentive: true,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data: res } = await axios.get(`${API}/api/incentives/my/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching wallet claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate pending sum
  const pendingIncentiveSum = data.claims
    .filter((c) => c.status === 'Approval Pending')
    .reduce((sum, c) => sum + (c.totalIncentive || 0), 0);

  const filtered = data.claims.filter(
    (g) => statusFilter === 'All' || g.status === statusFilter
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your installation incentive earnings and claim approvals.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Incentive Earned</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                ₹{(data.wallet.incentive || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {!data.eligibleForIncentive && (
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Blocked from incentives
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-yellow-50 rounded-2xl text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Claims</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                ₹{pendingIncentiveSum.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Incentive Claims History</h2>
          
          {/* Status Filters */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            {['All', 'Approval Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status === 'Approval Pending' ? 'Pending' : status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b189b]"></div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#5b189b]" />
            <p className="text-sm font-semibold">No claims found.</p>
            <p className="text-xs mt-1">Claims appear here after you register motor installations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3">Serial Number</th>
                  <th className="py-3">Model Code/Name</th>
                  <th className="py-3">Claim Date</th>
                  <th className="py-3 text-right">Incentive</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {paginated.map((claim) => {
                  const representativeItem = claim.items?.[0] || {};
                  const StatusIcon = STATUS_ICON[claim.status] || Clock;

                  return (
                    <tr key={claim._id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-mono font-bold text-gray-900">
                        {representativeItem.serialNumber || 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-gray-700">
                          {representativeItem.model?.code || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {claim.modelName || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(claim.claimDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-gray-900">
                        ₹{(claim.totalIncentive || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[claim.status]
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {claim.status === 'Approval Pending' ? 'Pending' : claim.status}
                        </span>
                        {claim.status === 'Rejected' && claim.rejectionReason && (
                          <span className="text-[10px] text-rose-500 block mt-1 max-w-[150px] mx-auto truncate" title={claim.rejectionReason}>
                            Reason: {claim.rejectionReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">
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
        )}
      </div>
    </div>
  );
}
