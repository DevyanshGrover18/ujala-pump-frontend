import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Search,
  Calendar,
  User,
  Phone,
  Building2,
  QrCode,
  Upload,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileCheck,
  CreditCard,
  Trash2,
  UserCheck,
  Box,
} from 'lucide-react';
import ModelWiseIncentivesView from '../Incentives/ModelWiseIncentivesView';

const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const STATUS_ICON = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
};

const ROLE_BADGE = {
  Distributor: 'bg-purple-50 text-purple-700 border-purple-200',
  Dealer: 'bg-red-50 text-red-700 border-red-200',
  SubDealer: 'bg-teal-50 text-teal-700 border-teal-200',
  Plumber: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

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

const PER_PAGE = 12;

export default function Payouts() {
  const { user } = useContext(AuthContext);
  const isReadOnly = user?.role === 'accounts';
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalRequestedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    rejectedCount: 0,
  });
  const [thresholds, setThresholds] = useState({
    distributorMinPayout: 500,
    dealerMinPayout: 500,
    subDealerMinPayout: 500,
    plumberMinPayout: 200,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(
    () => getLast30DaysRange().startDate
  );
  const [endDate, setEndDate] = useState(() => getLast30DaysRange().endDate);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('payouts'); // 'payouts' | 'models'
  const [incentivesData, setIncentivesData] = useState([]);
  const [loadingIncentives, setLoadingIncentives] = useState(false);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const payoutsRef = useRef(payouts);
  payoutsRef.current = payouts;

  const fetchIncentivesForModels = useCallback(async () => {
    setLoadingIncentives(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await axios.get(`${API}/api/incentives`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setIncentivesData(data || []);
    } catch (e) {
      console.error('Error loading incentives for model view in payouts:', e);
    } finally {
      setLoadingIncentives(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (viewMode === 'models') {
      fetchIncentivesForModels();
    }
  }, [viewMode, fetchIncentivesForModels]);

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (roleFilter !== 'All' && roleFilter !== 'Accounts')
        params.requesterType = roleFilter;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(`${API}/api/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setPayouts(data.payouts || []);
      if (data.stats) setStats(data.stats);
      if (data.thresholds) setThresholds(data.thresholds);
      window.dispatchEvent(new Event('payouts-updated'));
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search, startDate, endDate]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

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
        else if (roleFilter === 'SubDealer')
          endpoint = `${API}/api/sub-dealers`;
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

          // Also merge any processedBy found in the payouts data
          (payoutsRef.current || []).forEach((p) => {
            if (p.processedBy) {
              const pb = p.processedBy;
              const pbId = pb._id ? String(pb._id) : String(pb);
              const pbName =
                pb.accountsMember?.name ||
                pb.name ||
                pb.username ||
                (pb.role === 'admin' ? 'Administrator' : 'Staff');
              const pbCode =
                pb.accountsMember?.accountsId ||
                (pb.role === 'admin' ? 'Admin' : '');
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
              m.distributorId ||
              m.dealerId ||
              m.subDealerId ||
              m.plumberId ||
              '';
            combinedMap.set(id, {
              _id: id,
              name: m.name || m.contactPerson || 'Unnamed',
              code,
            });
          });

          // Also merge any requesters found in the payouts data
          (payoutsRef.current || [])
            .filter((p) => p.requesterType === roleFilter && p.requesterName)
            .forEach((p) => {
              const key = p.requesterId
                ? String(p.requesterId)
                : p.requester
                  ? String(p.requester)
                  : p.requesterName;
              if (!combinedMap.has(key)) {
                combinedMap.set(key, {
                  _id: key,
                  name: p.requesterName,
                  code: '',
                });
              }
            });
        }

        setMembersList(Array.from(combinedMap.values()));
      } catch (err) {
        console.error('Error fetching members for role in payouts:', err);
        const uniqueFromPayouts = [];
        const seen = new Set();
        (payoutsRef.current || [])
          .filter((p) => p.requesterType === roleFilter && p.requesterName)
          .forEach((p) => {
            const key = p.requesterId
              ? String(p.requesterId)
              : p.requester
                ? String(p.requester)
                : p.requesterName;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueFromPayouts.push({
                _id: key,
                name: p.requesterName,
                code: '',
              });
            }
          });
        setMembersList(uniqueFromPayouts);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembersForRole();
  }, [roleFilter]);

  // Apply member and date filter
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      // Date filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(p.requestedAt || p.createdAt) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(p.requestedAt || p.createdAt) > end) return false;
      }

      if (roleFilter === 'Accounts') {
        if (!p.processedBy) return false;
        if (memberFilter === 'All') return true;
        const pb = p.processedBy;
        const pbId = pb._id ? String(pb._id) : String(pb);
        const pbAccId = pb.accountsMember?._id
          ? String(pb.accountsMember._id)
          : '';
        const pbUsername = pb.username || '';
        const pbName = pb.accountsMember?.name || pb.name || '';
        return (
          pbId === String(memberFilter) ||
          pbAccId === String(memberFilter) ||
          pbUsername === String(memberFilter) ||
          pbName === String(memberFilter)
        );
      }

      if (roleFilter !== 'All' && roleFilter !== 'Accounts') {
        if (p.requesterType !== roleFilter) return false;
      }

      const matchMember =
        memberFilter === 'All' ||
        (p.requesterId && String(p.requesterId) === String(memberFilter)) ||
        (p.requester && String(p.requester) === String(memberFilter)) ||
        p.requesterName === memberFilter;
      return matchMember;
    });
  }, [payouts, roleFilter, memberFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredPayouts.length / PER_PAGE));
  const paginatedPayouts = filteredPayouts.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  // Totals calculations
  const totalPayoutAmount = useMemo(() => {
    return filteredPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayouts]);

  const totalPendingAmount = useMemo(() => {
    return filteredPayouts
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayouts]);

  const totalApprovedAmount = useMemo(() => {
    return filteredPayouts
      .filter((p) => p.status === 'Approved')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayouts]);

  const selectedMemberName = useMemo(() => {
    if (memberFilter === 'All') return null;
    const found = membersList.find(
      (m) => String(m._id) === String(memberFilter) || m.name === memberFilter
    );
    return found
      ? found.code
        ? `${found.name} (${found.code})`
        : found.name
      : memberFilter;
  }, [memberFilter, membersList]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedPayouts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} payout request(s)? Held balances for any pending requests will be refunded to user wallets.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${API}/api/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedIds },
      });

      toast.success(data.message || 'Payout requests deleted successfully');
      setSelectedIds([]);
      fetchPayouts();
    } catch (err) {
      console.error('Delete multiple payouts error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to delete payout requests'
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex w-full flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Payout Requests
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Review and disburse wallet incentive withdrawal requests from
            distributors, dealers, sub-dealers, and plumbers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          {/* View Switcher (Only visible to Admin) */}
          {user?.role === 'admin' && (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('payouts')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'payouts'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Payouts</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('models')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

          {!isReadOnly && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Threshold Limits</span>
            </button>
          )}

          <button
            onClick={() => {
              if (viewMode === 'models') fetchIncentivesForModels();
              else fetchPayouts();
            }}
            disabled={loading || loadingIncentives}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading || loadingIncentives ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div
          className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102 flex flex-col justify-between"
          style={{ background: '#7C3AED' }} // Purple
        >
          <div>
            <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-white/90">
              Total Requested
            </h3>
            <p className="text-2xl sm:text-2xl font-bold">
              ₹{stats.totalRequestedAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-xs text-white/80 mt-2 font-medium">
            {stats.totalCount} total withdrawal claims
          </p>
        </div>

        {/* Pending Processing */}
        <div
          className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102 flex flex-col justify-between"
          style={{ background: '#FB923C' }} // Orange
        >
          <div>
            <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-white/90">
              Pending Processing
            </h3>
            <p className="text-2xl sm:text-2xl font-bold">
              ₹{stats.pendingAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-xs text-white/80 mt-2 font-medium">
            {stats.pendingCount} requests awaiting payment
          </p>
        </div>

        {/* Disbursed (Paid) */}
        <div
          className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102 flex flex-col justify-between"
          style={{ background: '#10B981' }} // Green
        >
          <div>
            <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-white/90">
              Total Paid
            </h3>
            <p className="text-2xl sm:text-2xl font-bold">
              ₹{stats.approvedAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-xs text-white/80 mt-2 font-medium">
            {stats.approvedCount} payouts paid
          </p>
        </div>

        {/* Rejected */}
        <div
          className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102 flex flex-col justify-between"
          style={{ background: '#EF4444' }} // Red
        >
          <div>
            <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-white/90">
              Rejected Requests
            </h3>
            <p className="text-2xl sm:text-2xl font-bold">
              {stats.rejectedCount}
            </p>
          </div>
          <p className="text-xs text-white/80 mt-2 font-medium">
            Balances refunded to wallets
          </p>
        </div>
      </div>

      {/* View Content */}
      {user?.role === 'admin' && viewMode === 'models' ? (
        <ModelWiseIncentivesView
          groups={incentivesData}
          loading={loadingIncentives}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        /* Main Table Card */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Controls Toolbar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3">
            {/* Row 1: Search + Status Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requester, phone, UPI, A/C..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    setSelectedIds([]);
                  }}
                  className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 shrink-0 self-start sm:self-auto">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(1);
                      setSelectedIds([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === status
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {status === 'Approved' ? 'Paid' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Secondary Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                    setSelectedIds([]);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
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

                {/* 2. Member Filter (Dynamic based on selected Role) */}
                <select
                  value={memberFilter}
                  onChange={(e) => {
                    setMemberFilter(e.target.value);
                    setPage(1);
                    setSelectedIds([]);
                  }}
                  disabled={roleFilter === 'All'}
                  className={`px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[170px] shadow-2xs ${
                    roleFilter === 'All'
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-800 border-purple-200 cursor-pointer'
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
                <div className="flex items-center gap-1.5 bg-gray-50/90 border border-gray-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
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
                        setSelectedIds([]);
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
                        setSelectedIds([]);
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
                        setSelectedIds([]);
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
              {!isReadOnly && selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Requests Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-purple-600"></div>
              <p className="text-xs text-gray-400 mt-3 font-medium">
                Loading requests...
              </p>
            </div>
          ) : paginatedPayouts.length === 0 ? (
            <div className="text-center py-16 px-4 text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20 text-purple-600" />
              <p className="text-sm font-bold text-gray-600">
                No payout requests found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Requests raised by sellers and plumbers will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {!isReadOnly && (
                      <th className="py-3.5 px-5 w-10">
                        <input
                          type="checkbox"
                          checked={
                            paginatedPayouts.length > 0 &&
                            paginatedPayouts.every((p) =>
                              selectedIds.includes(p._id)
                            )
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 accent-purple-600 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-5">Requester</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5 text-right">Amount</th>
                    <th className="py-3.5 px-5">Payout Destination</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    {user?.role === 'admin' && (
                      <th className="py-3.5 px-5">Processed By</th>
                    )}
                    <th className="py-3.5 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {paginatedPayouts.map((payout) => {
                    const StatusIcon = STATUS_ICON[payout.status] || Clock;

                    return (
                      <tr
                        key={payout._id}
                        className={`hover:bg-gray-50/60 transition-colors ${selectedIds.includes(payout._id) ? 'bg-purple-50/50' : ''}`}
                      >
                        {!isReadOnly && (
                          <td className="py-4 px-5">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(payout._id)}
                              onChange={() => {
                                setSelectedIds((prev) =>
                                  prev.includes(payout._id)
                                    ? prev.filter((id) => id !== payout._id)
                                    : [...prev, payout._id]
                                );
                              }}
                              className="w-4 h-4 accent-purple-600 cursor-pointer"
                            />
                          </td>
                        )}
                        {/* Requester */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-gray-900">
                            {payout.requesterName}
                          </div>
                          {payout.requesterPhone && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {payout.requesterPhone}
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              ROLE_BADGE[payout.requesterType] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {payout.requesterType}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-5 text-right font-black text-gray-900 whitespace-nowrap">
                          ₹{(payout.amount || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Destination */}
                        <td className="py-4 px-5">
                          {payout.payoutMethod === 'UPI' ? (
                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-purple-700">
                              <QrCode className="w-3.5 h-3.5 text-purple-500" />
                              <span>{payout.upiId}</span>
                            </div>
                          ) : (
                            <div className="text-xs">
                              <div className="font-semibold text-gray-800 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-gray-400" />
                                <span>
                                  {payout.bankDetails?.bankName ||
                                    'Bank Account'}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                A/C: {payout.bankDetails?.accountNumber} &bull;
                                IFSC: {payout.bankDetails?.ifscCode}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Date */}
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

                        {/* Status */}
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

                        {/* Processed By (Admin Only) */}
                        {user?.role === 'admin' && (
                          <td className="py-4 px-5 whitespace-nowrap">
                            {payout.processedBy ? (
                              <div className="flex flex-col text-xs">
                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                                  {payout.processedBy.accountsMember?.name ||
                                    payout.processedBy.name ||
                                    payout.processedBy.username ||
                                    'Admin'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {payout.processedBy.role === 'admin'
                                    ? 'Administrator'
                                    : payout.processedBy.accountsMember
                                          ?.accountsId
                                      ? `Accounts (${payout.processedBy.accountsMember.accountsId})`
                                      : 'Accounts Team'}
                                  {payout.processedAt && (
                                    <>
                                      {' '}
                                      &bull;{' '}
                                      {new Date(
                                        payout.processedAt
                                      ).toLocaleDateString('en-IN')}
                                    </>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">
                                {payout.status === 'Pending'
                                  ? 'Pending Action'
                                  : '—'}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowProcessModal(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 mx-auto ${
                              payout.status === 'Pending'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>
                              {payout.status === 'Pending'
                                ? 'Process'
                                : 'Details'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Table Footer */}
                {!loading && filteredPayouts.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-xs font-bold text-gray-900">
                    <tr>
                      {!isReadOnly && <td className="py-3 px-5"></td>}
                      <td className="py-3 px-5 uppercase tracking-wider text-gray-500">
                        Total
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                          {filteredPayouts.length} request(s)
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-black text-sm text-gray-950 whitespace-nowrap">
                        ₹{totalPayoutAmount.toLocaleString('en-IN')}
                      </td>
                      <td
                        colSpan={user?.role === 'admin' ? 5 : 4}
                        className="py-3 px-5 text-gray-500 font-normal"
                      >
                        {selectedMemberName
                          ? `For ${selectedMemberName}`
                          : roleFilter !== 'All'
                            ? `For all ${roleFilter}s`
                            : 'Across all requests'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Bottom Total Amount Banner */}
          {!loading && filteredPayouts.length > 0 && (
            <div className="bg-purple-50/40 border-t border-purple-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-700">
                  {selectedMemberName ? (
                    <>
                      Showing payout summary for{' '}
                      <span className="text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                        {selectedMemberName}
                      </span>
                    </>
                  ) : roleFilter !== 'All' ? (
                    <>
                      Showing totals for all{' '}
                      <span className="text-purple-700 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                        {roleFilter}s
                      </span>
                    </>
                  ) : (
                    <>Showing totals for all filtered requests</>
                  )}
                </span>
                <span className="text-gray-400">&bull;</span>
                <span className="text-gray-600 font-medium">
                  {filteredPayouts.length} total requests
                </span>
              </div>

              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-purple-100 shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                    Total Amount
                  </span>
                  <span className="font-black text-sm text-purple-700">
                    ₹{totalPayoutAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-l border-gray-100 pl-4">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                    Pending
                  </span>
                  <span className="font-bold text-xs text-orange-600">
                    ₹{totalPendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-l border-gray-100 pl-4">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                    Paid
                  </span>
                  <span className="font-bold text-xs text-emerald-600">
                    ₹{totalApprovedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {viewMode === 'payouts' && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
              <span>
                Showing{' '}
                <span className="font-bold text-gray-700">
                  {(page - 1) * PER_PAGE + 1}
                </span>
                –
                <span className="font-bold text-gray-700">
                  {Math.min(page * PER_PAGE, filteredPayouts.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-gray-700">
                  {filteredPayouts.length}
                </span>{' '}
                requests
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
      )}

      {/* Threshold Rules Modal */}
      {showSettingsModal && (
        <ThresholdSettingsModal
          currentThresholds={thresholds}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={() => {
            setShowSettingsModal(false);
            fetchPayouts();
          }}
        />
      )}

      {/* Process / Details Modal */}
      {showProcessModal && selectedPayout && (
        <ProcessPayoutModal
          payout={selectedPayout}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedPayout(null);
          }}
          onSuccess={() => {
            setShowProcessModal(false);
            setSelectedPayout(null);
            fetchPayouts();
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Threshold Settings Modal Component
// -------------------------------------------------------------
function ThresholdSettingsModal({ currentThresholds, onClose, onSuccess }) {
  const [form, setForm] = useState({
    distributorMinPayout: currentThresholds?.distributorMinPayout ?? 500,
    dealerMinPayout: currentThresholds?.dealerMinPayout ?? 500,
    subDealerMinPayout: currentThresholds?.subDealerMinPayout ?? 500,
    plumberMinPayout: currentThresholds?.plumberMinPayout ?? 200,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/api/payouts/thresholds`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Payout minimum thresholds updated successfully');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update thresholds');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Minimum Payout Thresholds
              </h2>
              <p className="text-xs text-gray-500">
                Set the minimum amount required to raise a withdrawal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Distributor Min (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.distributorMinPayout}
                onChange={(e) =>
                  setForm({ ...form, distributorMinPayout: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Dealer Min (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.dealerMinPayout}
                onChange={(e) =>
                  setForm({ ...form, dealerMinPayout: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Sub-Dealer Min (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.subDealerMinPayout}
                onChange={(e) =>
                  setForm({ ...form, subDealerMinPayout: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Plumber Min (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.plumberMinPayout}
                onChange={(e) =>
                  setForm({ ...form, plumberMinPayout: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Thresholds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Process Payout Modal Component (Approve / Reject)
// -------------------------------------------------------------
function ProcessPayoutModal({ payout, onClose, onSuccess }) {
  const [action, setAction] = useState('approve');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceId, setReferenceId] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPending = payout.status === 'Pending';

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select a valid image file');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be under 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (action === 'reject' && !rejectionReason.trim()) {
      return toast.error('Please enter a rejection reason');
    }

    if (action === 'approve' && !proofImage) {
      return toast.error(
        'Payment proof screenshot/receipt is required to approve'
      );
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/api/payouts/${payout._id}/process`,
        {
          action,
          paymentMethod: action === 'approve' ? paymentMethod : undefined,
          referenceId: action === 'approve' ? referenceId.trim() : undefined,
          paymentProofImage: action === 'approve' ? proofImage : undefined,
          rejectionReason:
            action === 'reject' ? rejectionReason.trim() : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        action === 'approve'
          ? 'Payout marked as paid and completed'
          : 'Payout rejected and balance refunded'
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to process payout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isPending ? 'Process Payout Request' : 'Payout Details'}
            </h2>
            <p className="text-xs text-gray-500">
              Requested on{' '}
              {new Date(payout.requestedAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary Card */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-base">
                  {payout.requesterName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-purple-700 border border-purple-200">
                  {payout.requesterType}
                </span>
              </div>
              {payout.requesterPhone && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {payout.requesterPhone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Amount
              </p>
              <p className="text-2xl font-black text-purple-700">
                ₹{(payout.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Destination Details */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Payout Destination ({payout.payoutMethod})
            </p>
            {payout.payoutMethod === 'UPI' ? (
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-purple-700 bg-gray-50 p-3 rounded-xl">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>{payout.upiId}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 block font-medium">
                    Bank Name
                  </span>
                  <span className="font-bold text-gray-800">
                    {payout.bankDetails?.bankName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">
                    Account Holder
                  </span>
                  <span className="font-bold text-gray-800">
                    {payout.bankDetails?.accountHolderName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {payout.bankDetails?.accountNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">
                    IFSC Code
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {payout.bankDetails?.ifscCode || 'N/A'}
                  </span>
                </div>
              </div>
            )}
            {payout.notes && (
              <p className="text-xs text-gray-500 italic mt-1">
                <span className="font-semibold text-gray-600">
                  Requester note:
                </span>{' '}
                {payout.notes}
              </p>
            )}
          </div>

          {/* Form for Pending Request */}
          {isPending ? (
            <form onSubmit={handleProcess} className="space-y-4 pt-2">
              {/* Action Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    action === 'approve'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    action === 'reject'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Refund</span>
                </button>
              </div>

              {action === 'approve' ? (
                <div className="space-y-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Bank Transfer">
                        Bank Transfer (NEFT / IMPS / RTGS)
                      </option>
                      <option value="UPI">UPI Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Transaction / Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR12345678, UPI Ref #..."
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Payment Proof Screenshot / Receipt *
                    </label>
                    {proofImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-xs shadow-sm">
                        <img
                          src={proofImage}
                          alt="Payment Receipt"
                          className="w-full h-auto max-h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setProofImage(null)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white transition-colors">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">
                          Click to upload payment proof
                        </span>
                        <span className="text-[10px] text-gray-400">
                          PNG, JPG up to 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-rose-50/40 border border-rose-100 rounded-2xl p-4">
                  <div>
                    <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
                      Rejection Reason *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain why this request is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3.5 py-2 border border-rose-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium">
                    ⚠️ Rejecting this request will immediately refund ₹
                    {payout.amount.toLocaleString('en-IN')} back into the user's
                    active wallet balance.
                  </p>
                </div>
              )}

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
                  disabled={submitting}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-sm disabled:opacity-50 ${
                    action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : action === 'approve'
                      ? 'Confirm Payment'
                      : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          ) : (
            /* Completed / Readonly Details */
            <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Status Result
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[payout.status]}`}
                >
                  {payout.status === 'Approved' ? 'Paid' : payout.status}
                </span>
              </div>

              {payout.status === 'Approved' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-bold text-gray-900">
                      {payout.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  {payout.referenceId && (
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">Reference / Txn ID:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {payout.referenceId}
                      </span>
                    </div>
                  )}
                  {payout.paymentProofImage && (
                    <div className="pt-2">
                      <span className="text-gray-500 block mb-1 font-medium">
                        Payment Proof Receipt:
                      </span>
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-xs shadow-sm">
                        <img
                          src={payout.paymentProofImage}
                          alt="Proof Receipt"
                          className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            window.open(payout.paymentProofImage, '_blank')
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {payout.status === 'Rejected' && (
                <div className="bg-rose-50 p-3 rounded-xl text-xs text-rose-800">
                  <span className="font-bold block mb-0.5">
                    Rejection Reason:
                  </span>
                  <p>{payout.rejectionReason || 'No reason provided.'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
