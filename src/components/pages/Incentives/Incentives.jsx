import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
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
  RotateCcw,
  UserCheck,
  Calendar,
  Box,
} from 'lucide-react';
import ModelWiseIncentivesView from './ModelWiseIncentivesView';


const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  'Approval Pending': 'bg-amber-50 text-amber-800 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-800 border border-rose-200',
  Incomplete: 'bg-gray-100 text-gray-700 border border-gray-200',
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
                    {/* {d.sellerType !== 'Plumber' && ` &bull; ${seller.walletPoints ?? 0} pts`} */}
                  </span>
                </div>
              </div>
            </div>

            {/* Reapply Notes / Clarification if reapplied */}
            {(d.reapplyNotes || d.reappliedAt) && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Re-applied Claim (Submitted: {d.reappliedAt ? new Date(d.reappliedAt).toLocaleDateString() : 'Recent'})</span>
                </div>
                {d.previousRejectionReason && (
                  <p className="text-xs text-rose-700">
                    <span className="font-semibold">Previous Rejection:</span> {d.previousRejectionReason}
                  </p>
                )}
                {d.reapplyNotes && (
                  <p className="text-xs text-amber-900 mt-1">
                    <span className="font-semibold">Claimant's Clarification:</span> "{d.reapplyNotes}"
                  </p>
                )}
              </div>
            )}

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
                      {/* {d.sellerType !== 'Plumber' && (
                        <> &bull; <span>{c.points} pts</span></>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>
                  ₹{group.totalIncentive}
                  {/* {d.sellerType !== 'Plumber' && (
                    <> &bull; {group.totalPoints} pts</>
                  )} */}
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
                {d.status === 'Approved' ? 'Paid' : d.status}
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
              Approve & Pay
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

const getLast30DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

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
  const [startDate, setStartDate] = useState(() => getLast30DaysRange().startDate);
  const [endDate, setEndDate] = useState(() => getLast30DaysRange().endDate);
  const [viewMode, setViewMode] = useState('claims'); // 'claims' | 'models'
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(`${API}/api/incentives`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setGroups(data || []);
      window.dispatchEvent(new Event('incentives-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);


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
        else if (roleFilter === 'Accounts') endpoint = `${API}/api/accounts`;

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
        if (roleFilter === 'Accounts') {
          fetchedList.forEach((m) => {
            const id = m._id ? String(m._id) : m.username;
            combinedMap.set(id, {
              _id: id,
              name: m.name || m.username || 'Accounts Staff',
              code: m.accountsId || '',
              username: m.username,
            });
          });

          // Also merge any processedBy found in groups
          (groupsRef.current || []).forEach((g) => {
            if (g.processedBy) {
              const pb = g.processedBy;
              const pbId = pb._id ? String(pb._id) : String(pb);
              const pbName =
                pb.accountsMember?.name ||
                pb.name ||
                pb.username ||
                (pb.role === 'admin' ? 'Administrator' : 'Staff');
              const pbCode =
                pb.accountsMember?.accountsId || (pb.role === 'admin' ? 'Admin' : '');
              if (!combinedMap.has(pbId)) {
                combinedMap.set(pbId, {
                  _id: pbId,
                  name: pbName,
                  code: pbCode,
                  username: pb.username,
                });
              }
            }
          });
        } else {
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
          (groupsRef.current || [])
            .filter((g) => g.sellerType === roleFilter && g.sellerName)
            .forEach((g) => {
              const key = g.sellerId ? String(g.sellerId) : (g.seller ? String(g.seller) : g.sellerName);
              if (!combinedMap.has(key)) {
                combinedMap.set(key, {
                  _id: key,
                  name: g.sellerName,
                  code: '',
                });
              }
            });
        }

        setMembersList(Array.from(combinedMap.values()));
      } catch (err) {
        console.error('Error fetching members for role:', err);
        const uniqueFromGroups = [];
        const seen = new Set();
        (groupsRef.current || [])
          .filter((g) => g.sellerType === roleFilter && g.sellerName)
          .forEach((g) => {
            const key = g.sellerId ? String(g.sellerId) : (g.seller ? String(g.seller) : g.sellerName);
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
  }, [roleFilter]);

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

      if (roleFilter === 'Accounts') {
        if (!g.processedBy) return false;
        if (memberFilter === 'All') return matchSearch && matchStatus;
        const pb = g.processedBy;
        const pbId = pb._id ? String(pb._id) : String(pb);
        const pbAccId = pb.accountsMember?._id ? String(pb.accountsMember._id) : '';
        const pbUsername = pb.username || '';
        const pbName = pb.accountsMember?.name || pb.name || '';
        const matchAccountsMember =
          pbId === String(memberFilter) ||
          pbAccId === String(memberFilter) ||
          pbUsername === String(memberFilter) ||
          pbName === String(memberFilter);
        return matchSearch && matchStatus && matchAccountsMember;
      }

      const matchRole = roleFilter === 'All' || g.sellerType === roleFilter;
      const matchMember =
        memberFilter === 'All' ||
        (g.sellerId && String(g.sellerId) === String(memberFilter)) ||
        (g.seller && String(g.seller) === String(memberFilter)) ||
        g.sellerName === memberFilter;

      // Date filtering
      if (startDate) {
        const itemDate = g.claimDate || (g.items && g.items[0] && (g.items[0].claimDate || g.items[0].createdAt)) || g.createdAt;
        if (itemDate && new Date(itemDate) < new Date(startDate)) return false;
      }
      if (endDate) {
        const itemDate = g.claimDate || (g.items && g.items[0] && (g.items[0].claimDate || g.items[0].createdAt)) || g.createdAt;
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate && new Date(itemDate) > end) return false;
      }

      return matchSearch && matchStatus && matchRole && matchMember;
    });
  }, [groups, search, statusFilter, roleFilter, memberFilter, startDate, endDate]);

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incentive Claims</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve incentive claims from sellers and plumbers.
          </p>
        </div>

        {/* View Switcher (Only visible to Admin) */}
        {user?.role === 'admin' && (
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('claims')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'claims'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Claims View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('models')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'models'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Model-Wise Incentives</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Paid', value: stats.approved, color: 'text-emerald-600' },
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

      {/* View Content */}
      {user?.role === 'admin' && viewMode === 'models' ? (
        <ModelWiseIncentivesView
          groups={filtered}
          loading={loading}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Controls Toolbar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            {/* Row 1: Search Box + Status Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px]">
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
                  className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1 overflow-x-auto bg-gray-100 p-1 rounded-lg shrink-0 self-start sm:self-auto">
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
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === s
                        ? 'bg-white text-gray-900 shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {s === 'Approved' ? 'Paid' : s === 'Approval Pending' ? 'Pending' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Secondary Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Select Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                    setSelectedClaims([]);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Dealer">Dealer</option>
                  <option value="SubDealer">Sub-Dealer</option>
                  <option value="Plumber">Plumber</option>
                  {user?.role === 'admin' && (
                    <option value="Accounts">Accounts (Approved By)</option>
                  )}
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
                  className={`px-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[170px] ${
                    roleFilter === 'All'
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-800 border-blue-200 cursor-pointer'
                  }`}
                >
                  <option value="All">
                    {roleFilter === 'All'
                      ? 'All Members (Select Role)'
                      : loadingMembers
                        ? 'Loading Members...'
                        : roleFilter === 'Accounts'
                          ? `All Accounts Members (${membersList.length})`
                          : `All ${roleFilter}s (${membersList.length})`}
                  </option>
                  {membersList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m.code ? `(${m.code})` : ''}
                    </option>
                  ))}
                </select>

                {/* 3. Date Range Filter */}
                <div className="flex items-center gap-1.5 bg-gray-50/90 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => startDateRef.current?.showPicker?.()}
                  >
                    <input
                      ref={startDateRef}
                      type="date"
                      value={startDate}
                      onClick={(e) => e.target.showPicker?.()}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                        setSelectedClaims([]);
                      }}
                      className="bg-transparent text-gray-700 text-xs font-medium focus:outline-none cursor-pointer w-[105px] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0"
                      title="Start Date"
                    />
                  </div>
                  <span className="text-gray-400 font-semibold select-none px-0.5">to</span>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => endDateRef.current?.showPicker?.()}
                  >
                    <input
                      ref={endDateRef}
                      type="date"
                      value={endDate}
                      onClick={(e) => e.target.showPicker?.()}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                        setSelectedClaims([]);
                      }}
                      className="bg-transparent text-gray-700 text-xs font-medium focus:outline-none cursor-pointer w-[105px] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0"
                      title="End Date"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStartDate('');
                        setEndDate('');
                        setPage(1);
                        setSelectedClaims([]);
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-0.5 cursor-pointer"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Delete */}
              {!isReadOnly && selectedClaims.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedClaims.length})</span>
                </button>
              )}
            </div>
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
                    'Status',
                    ...(user?.role === 'admin' ? ['Processed By'] : []),
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
                      colSpan={!isReadOnly ? (user?.role === 'admin' ? 9 : 8) : (user?.role === 'admin' ? 8 : 7)}
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
                      colSpan={!isReadOnly ? (user?.role === 'admin' ? 9 : 8) : (user?.role === 'admin' ? 8 : 7)}
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
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                            {g.sellerName}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-200/80 font-medium">
                              {g.sellerType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {g.items?.length > 1 ? (
                              <button
                                onClick={() =>
                                  setExpanded((e) => ({
                                    ...e,
                                    [g.saleGroupId || g._id]: !isExpanded,
                                  }))
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200/80 rounded-md text-gray-800 font-semibold transition-colors cursor-pointer"
                              >
                                <span>{g.items?.length} items</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform text-gray-500 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            ) : (
                              <span className="text-gray-600 font-mono">
                                {g.items?.[0]?.serialNumber || '1 item'}
                              </span>
                            )}
                          </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {new Date(g.claimDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-gray-900 font-mono">
                          ₹{(g.totalIncentive || 0).toLocaleString('en-IN')}
                        </td>
                        {/* <td className="px-5 py-3.5 text-xs font-semibold text-gray-700 font-mono">
                          {g.sellerType === 'Plumber' ? '—' : `${g.totalPoints || 0} pts`}
                        </td> */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                STATUS_BADGE[g.status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <SIcon className="w-3 h-3" />
                              <span>{g.status === 'Approval Pending' ? 'Pending' : g.status === 'Approved' ? 'Paid' : g.status}</span>
                            </span>
                            {g.reappliedAt && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                title={g.reapplyNotes ? `Note: ${g.reapplyNotes}` : 'Claim has been re-submitted'}
                              >
                                <RotateCcw className="w-2.5 h-2.5 text-blue-600" />
                                <span>Reapplied</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Processed By (Admin Only) */}
                        {user?.role === 'admin' && (
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {g.processedBy ? (
                              <div className="flex flex-col text-xs">
                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                  {g.processedBy.accountsMember?.name ||
                                    g.processedBy.name ||
                                    g.processedBy.username ||
                                    'Admin'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {g.processedBy.role === 'admin'
                                    ? 'Administrator'
                                    : g.processedBy.accountsMember?.accountsId
                                    ? `Accounts (${g.processedBy.accountsMember.accountsId})`
                                    : 'Accounts Team'}
                                  {g.processedAt && (
                                    <> &bull; {new Date(g.processedAt).toLocaleDateString('en-IN')}</>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">
                                {g.status === 'Approval Pending' ? 'Pending Action' : '—'}
                              </span>
                            )}
                          </td>
                        )}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedGroup(g)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 bg-white shadow-2xs transition-all active:scale-95 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              <span>Verify</span>
                            </button>
                            {!isReadOnly && (
                              <button
                                onClick={() => handleDelete(g._id)}
                                className="p-1 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-600 transition-colors cursor-pointer"
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
                          <tr key={idx} className="bg-gray-50/60 text-xs">
                            {!isReadOnly && <td className="px-5 py-2" />}
                            <td className="pl-8 pr-5 py-2 text-gray-600 font-mono font-medium">
                              #{idx + 1} &bull; {item.serialNumber}
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
                            <td className="px-5 py-2 text-gray-900 font-bold font-mono">
                              ₹{item.incentiveAmount}
                            </td>
                            {/* <td className="px-5 py-2 text-gray-700 font-medium font-mono">
                              {g.sellerType === 'Plumber' ? '—' : `${item.points} pts`}
                            </td> */}
                            <td colSpan={user?.role === 'admin' ? 3 : 2} />
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
                  {/* <td className="px-5 py-3 text-sm font-black text-purple-700 whitespace-nowrap">
                    {roleFilter === 'Plumber' ? '—' : `${totalPointsAmount.toLocaleString('en-IN')} pts`}
                  </td> */}
                  <td colSpan={user?.role === 'admin' ? 3 : 2} className="px-5 py-3"></td>
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
              {/* {roleFilter !== 'Plumber' && (
                <div className="border-l border-gray-100 pl-4">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                    Total Points
                  </span>
                  <span className="font-black text-sm text-purple-700">
                    {totalPointsAmount.toLocaleString('en-IN')} pts
                  </span>
                </div>
              )} */}
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
      )}

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

