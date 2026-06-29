import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import {
  IndianRupee,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ChevronDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
  Approved: CheckCircle,
  Rejected: XCircle,
  Incomplete: AlertCircle,
};

const PER_PAGE = 15;

export default function WalletPage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    claims: [],
    wallet: { incentive: 0, points: 0 },
    eligibleForIncentive: true,
    eligibleForPoints: true,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.claims.filter(
    (g) => statusFilter === 'All' || g.status === statusFilter
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Incentive earnings and points history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IndianRupee className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Incentive Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(data.wallet.incentive || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {!data.eligibleForIncentive && (
            <p className="text-xs text-gray-400">Not eligible for incentive</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Star className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.wallet.points || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {!data.eligibleForPoints && (
            <p className="text-xs text-gray-400">Not eligible for points</p>
          )}
        </div>
      </div>

      {/* Claims History Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800">Claims History</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {['All', 'Approval Pending', 'Approved', 'Rejected', 'Incomplete'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === s
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'Approval Pending' ? 'Pending' : s}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Products', 'Incentive', 'Points', 'Status', 'Reason'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    No claims yet.
                  </td>
                </tr>
              ) : (
                paginated.map((g) => {
                  const SIcon = STATUS_ICON[g.status] || Clock;
                  const key = g.saleGroupId || g._id;
                  const isExpanded = expanded[key];
                  return (
                    <React.Fragment key={g._id}>
                      <tr className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {new Date(g.claimDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() =>
                              setExpanded((e) => ({ ...e, [key]: !isExpanded }))
                            }
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                          >
                            <Package className="w-3.5 h-3.5" />
                            {g.items?.length || 1} item
                            {(g.items?.length || 1) !== 1 ? 's' : ''}
                            {(g.items?.length || 0) > 1 && (
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                          ₹{g.totalIncentive}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {g.totalPoints} pts
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_BADGE[g.status] || ''
                            }`}
                          >
                            <SIcon className="w-3 h-3" />
                            {g.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {g.rejectionReason || '—'}
                        </td>
                      </tr>
                      {isExpanded &&
                        g.items?.map((item, idx) => (
                          <tr key={idx} className="bg-gray-50/40">
                            <td className="pl-10 pr-5 py-2 text-xs text-gray-500">
                              {new Date(item.claimDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-5 py-2 text-xs text-gray-700">
                              <span className="font-medium">{item.modelName}</span>
                              <span className="ml-2 font-mono text-gray-400">
                                {item.serialNumber}
                              </span>
                            </td>
                            <td className="px-5 py-2 text-xs text-gray-700">
                              ₹{item.incentiveAmount}
                            </td>
                            <td className="px-5 py-2 text-xs text-gray-700">
                              {item.points} pts
                            </td>
                            <td colSpan={2} />
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 border border-gray-200 rounded-lg">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
