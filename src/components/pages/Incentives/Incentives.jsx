import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
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

function VerifyModal({ group, onClose, onAction }) {
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
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
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onAction(group._id, action, rejectionReason.trim());
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
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
          <h2 className="text-base font-semibold text-gray-900">
            Verify Incentive Claim
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {loadingDetail ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading details...
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Seller / Plumber */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {d.sellerType === 'Plumber' ? 'Plumber' : 'Seller'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">{d.sellerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{d.sellerType}</span>
                </div>
                {(seller.contactPhone || seller.phone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{seller.contactPhone || seller.phone}</span>
                  </div>
                )}
                {seller.plumberId && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-gray-400">Plumber ID:</span>
                    <span className="font-semibold text-purple-600 font-mono text-xs">{seller.plumberId}</span>
                  </div>
                )}
                {seller.username && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-gray-400">Username:</span>
                    <span className="font-semibold text-gray-800">{seller.username}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 col-span-2">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    Wallet: ₹{seller.walletIncentive ?? 0} incentive 
                    {d.sellerType !== 'Plumber' && ` &bull; ${seller.walletPoints ?? 0} pts`}
                  </span>
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
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <span className="font-mono text-xs text-gray-500 mr-2">
                        {c.serialNumber}
                      </span>
                      <span className="font-medium text-gray-800">
                        {c.modelName}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <span>₹{c.incentiveAmount}</span>
                      {d.sellerType !== 'Plumber' && (
                        <> &bull; <span>{c.points} pts</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>
                  ₹{group.totalIncentive}
                  {d.sellerType !== 'Plumber' && (
                    <> &bull; {group.totalPoints} pts</>
                  )}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Customer Details
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Customer Name
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.customerName || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Customer Phone
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.customerPhone || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Customer Address
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.customerAddress || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Alternate Mobile
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.alternateMobileNumber || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Plumber Name
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.plumberName || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                    Plumber Mobile
                  </label>
                  <p className="font-semibold text-gray-900">
                    {sale.plumberMobileNumber || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Installation Details for Plumbers */}
            {d.sellerType === 'Plumber' && d.installation && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Installation Details
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                      Geolocation Coordinates
                    </label>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${d.installation.geolocation?.latitude},${d.installation.geolocation?.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1 mt-1 font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {d.installation.geolocation?.latitude?.toFixed(6)}, {d.installation.geolocation?.longitude?.toFixed(6)}
                    </a>
                  </div>
                  {d.installation.installationDate && (
                    <div>
                      <label className="block text-xs text-gray-400 font-medium uppercase mb-0.5">
                        Installation Date
                      </label>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {new Date(d.installation.installationDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {d.installation.image && (
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 font-medium uppercase mb-1">
                        Installation Photo
                      </label>
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-xs shadow-sm">
                        <img
                          src={d.installation.image}
                          alt="Installation"
                          className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(d.installation.image, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[d.status] || ''}`}
              >
                {d.status}
              </span>
              {d.rejectionReason && (
                <span className="text-red-600 text-xs">
                  — {d.rejectionReason}
                </span>
              )}
            </div>

            {/* Rejection reason */}
            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setAction(action === 'incomplete' ? null : 'incomplete')
              }
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${action === 'incomplete' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Incomplete
            </button>
            <button
              onClick={() => setAction(action === 'reject' ? null : 'reject')}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${action === 'reject' ? 'bg-red-600 text-white border-red-600' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
            >
              Reject
            </button>
            <button
              onClick={() => {
                setAction('approve');
                setTimeout(handleSubmit, 0);
              }}
              disabled={submitting}
              className="px-3 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        </div>
        {(action === 'reject' || action === 'incomplete') && (
          <div className="px-5 pb-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50 ${action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800'}`}
            >
              {submitting
                ? 'Submitting...'
                : `Confirm ${action === 'reject' ? 'Rejection' : 'Mark Incomplete'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PER_PAGE = 15;

export default function Incentives() {
  const { user } = useContext(AuthContext);
  const isReadOnly = user?.role === 'accounts';
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [selectedClaims, setSelectedClaims] = useState([]);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API}/api/incentives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Fetch / extract members when roleFilter changes
  useEffect(() => {
    if (roleFilter === 'All') {
      setMembersList([]);
      setMemberFilter('All');
      return;
    }

    setMemberFilter('All');

    const fetchMembersForRole = async () => {
      try {
        setLoadingMembers(true);
        const token = localStorage.getItem('token');
        let endpoint = '';
        if (roleFilter === 'Distributor') endpoint = `${API}/api/distributors`;
        else if (roleFilter === 'Dealer') endpoint = `${API}/api/dealers`;
        else if (roleFilter === 'SubDealer') endpoint = `${API}/api/sub-dealers`;
        else if (roleFilter === 'Plumber') endpoint = `${API}/api/plumbers`;

        let fetchedList = [];
        if (endpoint) {
          const res = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rawData =
            res.data?.data ||
            res.data?.subDealers ||
            res.data?.dealers ||
            res.data?.distributors ||
            res.data?.plumbers ||
            res.data ||
            [];
          fetchedList = Array.isArray(rawData) ? rawData : [];
        }

        const combinedMap = new Map();
        fetchedList.forEach((m) => {
          const id = m._id ? String(m._id) : m.name;
          const code =
            m.distributorId || m.dealerId || m.subDealerId || m.plumberId || '';
          combinedMap.set(id, {
            _id: id,
            name: m.name || m.contactPerson || 'Unnamed',
            code,
          });
        });

        // Also merge any sellers found in the groups data
        groups
          .filter((g) => g.sellerType === roleFilter && g.sellerName)
          .forEach((g) => {
            const key = g.sellerId ? String(g.sellerId) : g.sellerName;
            if (!combinedMap.has(key)) {
              combinedMap.set(key, {
                _id: key,
                name: g.sellerName,
                code: '',
              });
            }
          });

        setMembersList(Array.from(combinedMap.values()));
      } catch (err) {
        console.error('Error fetching members for role:', err);
        const uniqueFromGroups = [];
        const seen = new Set();
        groups
          .filter((g) => g.sellerType === roleFilter && g.sellerName)
          .forEach((g) => {
            const key = g.sellerId ? String(g.sellerId) : g.sellerName;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueFromGroups.push({
                _id: key,
                name: g.sellerName,
                code: '',
              });
            }
          });
        setMembersList(uniqueFromGroups);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembersForRole();
  }, [roleFilter, groups]);

  const handleAction = async (claimId, action, rejectionReason) => {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API}/api/incentives/${claimId}/verify`,
      { action, rejectionReason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchClaims();
  };

  const handleDelete = async (claimId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this incentive claim group?'
      )
    )
      return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/incentives/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClaims();
    } catch (err) {
      console.error('Failed to delete claim group:', err);
      alert(err?.response?.data?.message || 'Failed to delete claim group.');
    }
  };

  const handleSelect = (id) => {
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedClaims(paginated.map((g) => g._id));
    } else {
      setSelectedClaims([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedClaims.length} selected incentive claim groups?`
      )
    ) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/api/incentives`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { claimIds: selectedClaims },
        });
        fetchClaims();
        setSelectedClaims([]);
      } catch (err) {
        console.error('Failed to delete claims:', err);
        alert(err?.response?.data?.message || 'Failed to delete claims.');
      }
    }
  };

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        !search ||
        g.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
        g.items?.some(
          (i) =>
            i.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
            i.modelName?.toLowerCase().includes(search.toLowerCase())
        );
      const matchStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchRole = roleFilter === 'All' || g.sellerType === roleFilter;
      const matchMember =
        memberFilter === 'All' ||
        (g.sellerId && String(g.sellerId) === String(memberFilter)) ||
        g.sellerName === memberFilter;

      return matchSearch && matchStatus && matchRole && matchMember;
    });
  }, [groups, search, statusFilter, roleFilter, memberFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Bottom Totals Calculation
  const totalIncentiveAmount = useMemo(() => {
    return filtered.reduce((sum, g) => sum + (Number(g.totalIncentive) || 0), 0);
  }, [filtered]);

  const totalPointsAmount = useMemo(() => {
    return filtered.reduce((sum, g) => sum + (Number(g.totalPoints) || 0), 0);
  }, [filtered]);

  const selectedMemberName = useMemo(() => {
    if (memberFilter === 'All') return null;
    const found = membersList.find((m) => String(m._id) === String(memberFilter) || m.name === memberFilter);
    return found ? (found.code ? `${found.name} (${found.code})` : found.name) : memberFilter;
  }, [memberFilter, membersList]);

  const stats = {
    total: groups.length,
    pending: groups.filter((g) => g.status === 'Approval Pending').length,
    approved: groups.filter((g) => g.status === 'Approved').length,
    rejected: groups.filter((g) => g.status === 'Rejected').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incentive Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review and approve incentive & points claims from sellers and plumbers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-rose-600' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-xs"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search seller, model, serial..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelectedClaims([]);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* 1. Select Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
              setSelectedClaims([]);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Distributor">Distributor</option>
            <option value="Dealer">Dealer</option>
            <option value="SubDealer">Sub-Dealer</option>
            <option value="Plumber">Plumber</option>
          </select>

          {/* 2. Select Member Filter (Dynamic based on Role) */}
          <select
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setPage(1);
              setSelectedClaims([]);
            }}
            disabled={roleFilter === 'All'}
            className={`px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[170px] ${
              roleFilter === 'All'
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-800 border-blue-200'
            }`}
          >
            <option value="All">
              {roleFilter === 'All'
                ? 'All Members (Select Role)'
                : loadingMembers
                ? 'Loading Members...'
                : `All ${roleFilter}s (${membersList.length})`}
            </option>
            {membersList.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} {m.code ? `(${m.code})` : ''}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {[
              'All',
              'Approval Pending',
              'Approved',
              'Rejected',
              'Incomplete',
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                  setSelectedClaims([]);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'Approval Pending' ? 'Pending' : s}
              </button>
            ))}
          </div>

          {!isReadOnly && selectedClaims.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center justify-center space-x-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-semibold shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete ({selectedClaims.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchClaims();
              setSelectedClaims([]);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"
            title="Refresh Claims"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {!isReadOnly && (
                  <th className="px-5 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginated.length > 0 &&
                        selectedClaims.length === paginated.length
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                )}
                {[
                  'Seller / Member',
                  'Type',
                  'Products',
                  'Date',
                  'Incentive',
                  'Points',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading incentive claims...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    No claims found matching current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((g) => {
                  const SIcon = STATUS_ICON[g.status] || Clock;
                  const isExpanded = expanded[g.saleGroupId || g._id];
                  return (
                    <React.Fragment key={g._id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        {!isReadOnly && (
                          <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedClaims.includes(g._id)}
                              onChange={() => handleSelect(g._id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                          {g.sellerName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            {g.sellerType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">
                          <button
                            onClick={() =>
                              setExpanded((e) => ({
                                ...e,
                                [g.saleGroupId || g._id]: !isExpanded,
                              }))
                            }
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium"
                          >
                            {g.items?.length || 1} item
                            {g.items?.length !== 1 ? 's' : ''}
                            {g.items?.length > 1 && (
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {new Date(g.claimDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-gray-900">
                          ₹{g.totalIncentive?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-purple-700 font-semibold">
                          {g.sellerType === 'Plumber' ? '—' : `${g.totalPoints || 0} pts`}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_BADGE[g.status] || ''
                            }`}
                          >
                            <SIcon className="w-3 h-3" />
                            {g.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedGroup(g)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Verify
                            </button>
                            {!isReadOnly && (
                              <button
                                onClick={() => handleDelete(g._id)}
                                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Delete Claim"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        g.items?.map((item, idx) => (
                          <tr key={idx} className="bg-gray-50/50 text-xs">
                            {!isReadOnly && <td className="px-5 py-2" />}
                            <td className="pl-10 pr-5 py-2 text-gray-500 font-mono">
                              {item.serialNumber}
                            </td>
                            <td
                              colSpan={2}
                              className="px-5 py-2 text-gray-700 font-medium"
                            >
                              {item.modelName}
                            </td>
                            <td className="px-5 py-2 text-gray-500">
                              {new Date(item.claimDate).toLocaleDateString(
                                'en-IN'
                              )}
                            </td>
                            <td className="px-5 py-2 text-gray-800 font-semibold">
                              ₹{item.incentiveAmount}
                            </td>
                            <td className="px-5 py-2 text-purple-700 font-medium">
                              {g.sellerType === 'Plumber' ? '—' : `${item.points} pts`}
                            </td>
                            <td colSpan={2} />
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Totals */}
            {!loading && filtered.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-xs font-bold text-gray-900">
                <tr>
                  {!isReadOnly && <td className="px-5 py-3"></td>}
                  <td className="px-5 py-3 uppercase tracking-wider text-gray-500">
                    Total
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                      {filtered.length} claim(s)
                    </span>
                  </td>
                  <td colSpan={2} className="px-5 py-3 text-gray-500 font-normal">
                    {selectedMemberName ? `For ${selectedMemberName}` : roleFilter !== 'All' ? `For all ${roleFilter}s` : 'Across all claims'}
                  </td>
                  <td className="px-5 py-3 text-sm font-black text-gray-950 whitespace-nowrap">
                    ₹{totalIncentiveAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-sm font-black text-purple-700 whitespace-nowrap">
                    {roleFilter === 'Plumber' ? '—' : `${totalPointsAmount.toLocaleString('en-IN')} pts`}
                  </td>
                  <td colSpan={2} className="px-5 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Bottom Filter & Total Summary Banner */}
        {!loading && filtered.length > 0 && (
          <div className="bg-blue-50/40 border-t border-blue-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">
                {selectedMemberName ? (
                  <>
                    Showing summary for{' '}
                    <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                      {selectedMemberName}
                    </span>
                  </>
                ) : roleFilter !== 'All' ? (
                  <>
                    Showing totals for all{' '}
                    <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                      {roleFilter}s
                    </span>
                  </>
                ) : (
                  <>Showing totals for all filtered records</>
                )}
              </span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-gray-600 font-medium">
                {filtered.length} total claims
              </span>
            </div>

            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-2xs">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                  Total Incentive
                </span>
                <span className="font-black text-sm text-gray-900">
                  ₹{totalIncentiveAmount.toLocaleString('en-IN')}
                </span>
              </div>
              {roleFilter !== 'Plumber' && (
                <div className="border-l border-gray-100 pl-4">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                    Total Points
                  </span>
                  <span className="font-black text-sm text-purple-700">
                    {totalPointsAmount.toLocaleString('en-IN')} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  setSelectedClaims([]);
                }}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  setSelectedClaims([]);
                }}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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

