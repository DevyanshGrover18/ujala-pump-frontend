import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Gift,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Star,
  ChevronDown,
  Trash2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  "Approval Pending": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Approved: "bg-green-50 text-green-700 border border-green-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
  Incomplete: "bg-gray-100 text-gray-600 border border-gray-200",
};

const STATUS_ICON = {
  "Approval Pending": Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
  Incomplete: AlertCircle,
};

function VerifyModal({ group, onClose, onAction }) {
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/incentives/${group._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetail(data);
      } catch (e) {
        console.error(e);
        setDetail(group);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [group._id]);

  const handleSubmit = async () => {
    if (!action) return;
    if (action === "reject" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onAction(group._id, action, rejectionReason.trim());
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const d = detail || group;
  const sale = d.sale || {};
  const seller = d.seller || {};
  const groupClaims = d.groupClaims || d.items || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Verify Incentive Claim</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {loadingDetail ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading details...</div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Seller */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Seller</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-400" /><span className="font-medium">{d.sellerName}</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-400">{d.sellerType}</span></div>
                {seller.contactPhone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /><span>{seller.contactPhone}</span></div>}
                <div className="flex items-center gap-2 col-span-2">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                  <span>Wallet: ₹{seller.walletIncentive ?? 0} incentive &bull; {seller.walletPoints ?? 0} pts</span>
                </div>
              </div>
            </div>

            {/* Products in this claim group */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Products ({groupClaims.length})
              </p>
              <div className="space-y-2">
                {groupClaims.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-mono text-xs text-gray-500 mr-2">{c.serialNumber}</span>
                      <span className="font-medium text-gray-800">{c.modelName}</span>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <span>₹{c.incentiveAmount}</span> &bull; <span>{c.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{group.totalIncentive} &bull; {group.totalPoints} pts</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer Details</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Customer Name</label>
                  <p className="font-semibold text-gray-900">{sale.customerName || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Customer Phone</label>
                  <p className="font-semibold text-gray-900">{sale.customerPhone || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Customer Address</label>
                  <p className="font-semibold text-gray-900">{sale.customerAddress || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Alternate Mobile</label>
                  <p className="font-semibold text-gray-900">{sale.alternateMobileNumber || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Plumber Name</label>
                  <p className="font-semibold text-gray-900">{sale.plumberName || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">Plumber Mobile</label>
                  <p className="font-semibold text-gray-900">{sale.plumberMobileNumber || "—"}</p>
                </div>
              </div>
            </div>

            {/* Current status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[d.status] || ""}`}>{d.status}</span>
              {d.rejectionReason && <span className="text-red-600 text-xs">— {d.rejectionReason}</span>}
            </div>

            {/* Rejection reason */}
            {action === "reject" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <div className="flex gap-2">
            <button
              onClick={() => setAction(action === "incomplete" ? null : "incomplete")}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${action === "incomplete" ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Incomplete
            </button>
            <button
              onClick={() => setAction(action === "reject" ? null : "reject")}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${action === "reject" ? "bg-red-600 text-white border-red-600" : "border-red-300 text-red-600 hover:bg-red-50"}`}
            >
              Reject
            </button>
            <button
              onClick={() => { setAction("approve"); setTimeout(handleSubmit, 0); }}
              disabled={submitting}
              className="px-3 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        </div>
        {(action === "reject" || action === "incomplete") && (
          <div className="px-5 pb-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50 ${action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"}`}
            >
              {submitting ? "Submitting..." : `Confirm ${action === "reject" ? "Rejection" : "Mark Incomplete"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PER_PAGE = 15;

export default function Incentives() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/api/incentives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleAction = async (claimId, action, rejectionReason) => {
    const token = localStorage.getItem("token");
    await axios.post(`${API}/api/incentives/${claimId}/verify`, { action, rejectionReason }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchClaims();
  };

  const handleDelete = async (claimId) => {
    if (!window.confirm("Are you sure you want to delete this incentive claim group?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/incentives/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClaims();
    } catch (err) {
      console.error("Failed to delete claim group:", err);
      alert(err?.response?.data?.message || "Failed to delete claim group.");
    }
  };

  const filtered = groups.filter((g) => {
    const matchSearch = !search ||
      g.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
      g.items?.some(i => i.serialNumber?.toLowerCase().includes(search.toLowerCase()) || i.modelName?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total: groups.length,
    pending: groups.filter(g => g.status === "Approval Pending").length,
    approved: groups.filter(g => g.status === "Approved").length,
    rejected: groups.filter(g => g.status === "Rejected").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Incentive Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and approve incentive & points claims from sellers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search seller, model, serial..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="flex gap-1.5">
            {["All", "Approval Pending", "Approved", "Rejected", "Incomplete"].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s === "Approval Pending" ? "Pending" : s}
              </button>
            ))}
          </div>
          <button onClick={fetchClaims} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Seller", "Type", "Products", "Date", "Incentive", "Points", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No claims found.</td></tr>
              ) : paginated.map(g => {
                const SIcon = STATUS_ICON[g.status] || Clock;
                const isExpanded = expanded[g.saleGroupId || g._id];
                return (
                  <React.Fragment key={g._id}>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{g.sellerName}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">{g.sellerType}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        <button
                          onClick={() => setExpanded(e => ({ ...e, [g.saleGroupId || g._id]: !isExpanded }))}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                        >
                          {g.items?.length || 1} item{g.items?.length !== 1 ? "s" : ""}
                          {g.items?.length > 1 && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(g.claimDate).toLocaleDateString("en-IN")}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{g.totalIncentive}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{g.totalPoints} pts</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[g.status] || ""}`}>
                          <SIcon className="w-3 h-3" />
                          {g.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedGroup(g)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete Claim"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && g.items?.map((item, idx) => (
                      <tr key={idx} className="bg-gray-50/50">
                        <td className="pl-10 pr-5 py-2 text-xs text-gray-500 font-mono">{item.serialNumber}</td>
                        <td colSpan={2} className="px-5 py-2 text-xs text-gray-700">{item.modelName}</td>
                        <td className="px-5 py-2 text-xs text-gray-500">{new Date(item.claimDate).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-2 text-xs text-gray-700">₹{item.incentiveAmount}</td>
                        <td className="px-5 py-2 text-xs text-gray-700">{item.points} pts</td>
                        <td colSpan={2} />
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-3 py-1 text-sm border border-gray-200 rounded-lg">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {selectedGroup && (
        <VerifyModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
