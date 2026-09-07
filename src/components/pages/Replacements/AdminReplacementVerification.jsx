import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
  Camera,
  X,
  CheckCircle,
  RefreshCw,
  Loader2,
  Check,
  Ban,
  Eye,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { AuthContext } from '../../../context/AuthContext';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminReplacementVerification() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token') || user?.token;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select state
  const [selectedItems, setSelectedItems] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal / Resolution state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionAction, setResolutionAction] = useState(null); // 'Approved' or 'Rejected'
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [resolving, setResolving] = useState(false);
  const [availableStock, setAvailableStock] = useState([]);
  const [fetchingStock, setFetchingStock] = useState(false);

  // QR scanner state for scanning new replacement
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Detail viewer modal
  const [viewRequest, setViewRequest] = useState(null);

  // Delete confirmation modal state: { type: 'single' | 'bulk', id?: string, serial?: string, count?: number }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/replacements?type=incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load replacement requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (resolutionAction === 'Approved' && !newSerialNumber.trim()) {
      return toast.error('Please assign a new replacement product serial number');
    }

    try {
      setResolving(true);
      const payload = {
        action: resolutionAction,
        adminRemarks,
        newSerialNumber: resolutionAction === 'Approved' ? newSerialNumber.trim() : undefined,
      };

      await axios.patch(
        `${API_URL}/api/replacements/${selectedRequest._id}/resolve`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Request ${resolutionAction === 'Approved' ? 'Approved' : 'Rejected'} successfully`);
      closeResolutionModal();
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Resolution failed');
    } finally {
      setResolving(false);
    }
  };

  // Delete single replacement request
  const handleDeleteSingle = async (id) => {
    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/api/replacements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Replacement request deleted successfully');
      setDeleteConfirm(null);
      setSelectedItems((prev) => prev.filter((item) => item !== id));
      fetchRequests();
    } catch (err) {
      console.error('Error deleting replacement request:', err);
      toast.error(err.response?.data?.message || 'Failed to delete replacement request');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete selected replacement requests
  const handleDeleteBulk = async () => {
    if (selectedItems.length === 0) return;
    try {
      setDeleting(true);
      await axios.post(
        `${API_URL}/api/replacements/bulk-delete`,
        { ids: selectedItems },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${selectedItems.length} replacement request(s) deleted successfully`);
      setDeleteConfirm(null);
      setSelectedItems([]);
      fetchRequests();
    } catch (err) {
      console.error('Error bulk deleting replacement requests:', err);
      toast.error(err.response?.data?.message || 'Failed to delete selected requests');
    } finally {
      setDeleting(false);
    }
  };

  // QR Scan
  const startScanning = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        if (videoRef.current) {
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              const raw = result.data;
              let scannedSerial = raw;
              try {
                const parsed = JSON.parse(raw);
                scannedSerial = parsed.serialNumber || parsed.serial || parsed.sn || raw;
              } catch {
                scannedSerial = raw;
              }
              const cleaned = String(scannedSerial)
                .replace(/[\u0000-\u001F\u007F-\u009F\uFEFF]/g, '')
                .trim();
              if (cleaned) {
                setNewSerialNumber(cleaned);
                stopScanning();
              }
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );
          await qrScannerRef.current.start();
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not access camera');
        setIsScanning(false);
      }
    }, 200);
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const openResolutionModal = async (req, action) => {
    setSelectedRequest(req);
    setResolutionAction(action);
    setNewSerialNumber('');
    setAdminRemarks('');

    if (action === 'Approved') {
      try {
        setFetchingStock(true);
        const res = await axios.get(`${API_URL}/api/replacements/${req._id}/available-stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableStock(res.data || []);
      } catch (err) {
        console.error('Error fetching replacement stock:', err);
        toast.error('Failed to load available stock for this model');
        setAvailableStock([]);
      } finally {
        setFetchingStock(false);
      }
    }
  };

  const closeResolutionModal = () => {
    setSelectedRequest(null);
    setResolutionAction(null);
    setAvailableStock([]);
    stopScanning();
  };

  const canResolve = (req) => {
    if (!user) return false;

    if (user.role === 'admin' || user.role === 'member') {
      return req.assignedToModel === 'UserRole';
    }

    if (user.role === 'distributor') {
      const myId = user.distributorId || user.distributor?._id || user.distributor;
      const targetId = req.assignedTo?._id || req.assignedTo;
      return req.assignedToModel === 'Distributor' && myId && targetId && String(myId) === String(targetId);
    }

    if (user.role === 'dealer') {
      const myId = user.dealerId || user.dealer?._id || user.dealer;
      const targetId = req.assignedTo?._id || req.assignedTo;
      return req.assignedToModel === 'Dealer' && myId && targetId && String(myId) === String(targetId);
    }

    return false;
  };

  // Filtered requests based on status tab and search input
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const oldSn = (r.oldSerialNumber || '').toLowerCase();
      const newSn = (r.newSerialNumber || '').toLowerCase();
      const reqName = (r.requestedBy?.name || '').toLowerCase();
      const reqModel = (r.requesterModel || '').toLowerCase();
      const reasonText = (r.reason || '').toLowerCase();
      const remarks = (r.adminRemarks || '').toLowerCase();

      return (
        oldSn.includes(q) ||
        newSn.includes(q) ||
        reqName.includes(q) ||
        reqModel.includes(q) ||
        reasonText.includes(q) ||
        remarks.includes(q)
      );
    });
  }, [requests, statusFilter, searchQuery]);

  // Export data prepared for Excel and PDF
  const exportData = useMemo(() => {
    return filteredRequests.map((req, index) => ({
      'S.No': index + 1,
      'Defective Serial': req.oldSerialNumber || 'N/A',
      'Requester Role': req.requesterModel || 'N/A',
      'Requested By': req.requestedBy?.name || req.requestedBy?.email || 'Unknown',
      'Assigned Resolver':
        req.assignedToModel === 'UserRole'
          ? 'Admin / Factory'
          : req.assignedTo?.name || 'Parent Seller',
      Reason: req.reason || 'N/A',
      Description: req.description || 'N/A',
      Status: req.status || 'Pending',
      'Replacement Serial':
        req.status === 'Approved'
          ? req.newSerialNumber || 'N/A'
          : req.status === 'Rejected'
          ? 'Rejected'
          : 'Awaiting',
      'Admin Remarks': req.adminRemarks || '',
      'Request Date': req.createdAt
        ? new Date(req.createdAt).toLocaleDateString()
        : '',
      'Resolved Date': req.resolvedAt
        ? new Date(req.resolvedAt).toLocaleDateString()
        : '',
    }));
  }, [filteredRequests]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const handleTabChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  // Multi-select handlers
  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllPaginatedSelected =
    paginatedRequests.length > 0 &&
    paginatedRequests.every((r) => selectedItems.includes(r._id));

  const handleSelectAllPaginated = () => {
    if (isAllPaginatedSelected) {
      const pageIds = paginatedRequests.map((r) => r._id);
      setSelectedItems((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedRequests.map((r) => r._id);
      setSelectedItems((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const isAllFilteredSelected =
    filteredRequests.length > 0 &&
    filteredRequests.every((r) => selectedItems.includes(r._id));

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredRequests.map((r) => r._id));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Replacement Queue</h1>
          <p className="text-gray-500 text-sm">
            Review, verify, and resolve product replacement requests.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Multi-select Delete Button */}
          {selectedItems.length > 0 && (
            <button
              onClick={() =>
                setDeleteConfirm({
                  type: 'bulk',
                  count: selectedItems.length,
                })
              }
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm text-xs font-semibold animate-in fade-in duration-150"
              title="Delete selected replacement requests"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedItems.length})</span>
            </button>
          )}

          <TableExportButtons
            exportName={`Replacements_${statusFilter}_List`}
            exportData={exportData}
            pdfOrientation="landscape"
          />
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm bg-white transition shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
            const count =
              status === 'All'
                ? requests.length
                : requests.filter((r) => r.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search serial, requester, reason..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selection Notice Banner */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>
              <strong>{selectedItems.length}</strong> request(s) selected
            </span>
            {filteredRequests.length > paginatedRequests.length && (
              <button
                onClick={handleSelectAllFiltered}
                className="underline text-blue-700 hover:text-blue-900 ml-2 font-semibold"
              >
                {isAllFilteredSelected
                  ? 'Clear selection'
                  : `Select all ${filteredRequests.length} matching requests`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedItems([])}
              className="px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              Deselect All
            </button>
            <button
              onClick={() =>
                setDeleteConfirm({
                  type: 'bulk',
                  count: selectedItems.length,
                })
              }
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedItems.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading replacement requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No requests found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No results matching "${searchQuery}". Try clearing your search query.`
                : `There are currently no ${statusFilter.toLowerCase()} replacement requests.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPaginatedSelected}
                      onChange={handleSelectAllPaginated}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="px-3 py-3.5 w-12 text-center">#</th>
                  <th className="px-4 py-3.5">Proof</th>
                  <th className="px-4 py-3.5">Defective Serial</th>
                  <th className="px-4 py-3.5">Requester</th>
                  <th className="px-4 py-3.5">Assigned Resolver</th>
                  <th className="px-4 py-3.5">Reason & Description</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Replacement Serial</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedRequests.map((req, index) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const hasImage = req.proofImages && req.proofImages.length > 0;
                  const canAct = req.status === 'Pending' && canResolve(req);
                  const isSelected = selectedItems.includes(req._id);

                  return (
                    <tr
                      key={req._id}
                      className={`transition-colors group ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-blue-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelect(req._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* S.No */}
                      <td className="px-3 py-3 text-center text-gray-400 font-mono">
                        {itemIndex}
                      </td>

                      {/* Proof Thumbnail */}
                      <td className="px-4 py-3">
                        {hasImage ? (
                          <button
                            onClick={() => setViewRequest(req)}
                            className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors block"
                            title="Click to view proof"
                          >
                            <img
                              src={req.proofImages[0]}
                              alt="Proof"
                              className="w-full h-full object-cover"
                            />
                            {req.proofImages.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 font-bold rounded-tl">
                                +{req.proofImages.length - 1}
                              </span>
                            )}
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Defective Serial */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs">
                          {req.oldSerialNumber}
                        </span>
                      </td>

                      {/* Requester */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {req.requestedBy?.name || 'Unknown'}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {req.requesterModel}
                        </span>
                      </td>

                      {/* Assigned Resolver */}
                      <td className="px-4 py-3">
                        <div className="text-gray-800 font-medium">
                          {req.assignedToModel === 'UserRole'
                            ? 'Admin / Factory'
                            : req.assignedTo?.name || 'Parent Seller'}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {req.assignedToModel}
                        </span>
                      </td>

                      {/* Reason & Description */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-gray-900 line-clamp-1">
                          {req.reason}
                        </div>
                        <div className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                          {req.description || 'No description provided'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Replacement Serial */}
                      <td className="px-4 py-3 font-mono">
                        {req.status === 'Approved' ? (
                          <div>
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-xs">
                              {req.newSerialNumber || 'N/A'}
                            </span>
                          </div>
                        ) : req.status === 'Rejected' ? (
                          <span className="text-gray-400 italic">Rejected</span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            Awaiting
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewRequest(req)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-100 transition"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Action for Pending */}
                          {canAct && (
                            <>
                              <button
                                onClick={() => openResolutionModal(req, 'Approved')}
                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                                title="Approve Request"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openResolutionModal(req, 'Rejected')}
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                                title="Reject Request"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Delete Action Button */}
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'single',
                                id: req._id,
                                serial: req.oldSerialNumber,
                              })
                            }
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 transition"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Summary Footer */}
        {!loading && filteredRequests.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>
                Showing{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredRequests.length
                  )}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-800">
                  {filteredRequests.length}
                </span>{' '}
                entries
              </span>
              <span className="text-gray-300">|</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700 focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded text-xs font-medium transition ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {deleteConfirm.type === 'bulk'
                    ? `Delete ${deleteConfirm.count} Requests?`
                    : 'Delete Replacement Request?'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {deleteConfirm.type === 'bulk'
                    ? `Are you sure you want to permanently delete these ${deleteConfirm.count} selected replacement requests? This action cannot be undone.`
                    : `Are you sure you want to delete the replacement request for defective serial "${deleteConfirm.serial}"? This action cannot be undone.`}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    if (deleteConfirm.type === 'bulk') {
                      handleDeleteBulk();
                    } else {
                      handleDeleteSingle(deleteConfirm.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base">
                {resolutionAction === 'Approved' ? 'Approve Replacement' : 'Reject Request'}
              </h3>
              <button
                onClick={closeResolutionModal}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                Resolving request for defective serial number:{' '}
                <strong className="font-mono text-gray-900">{selectedRequest.oldSerialNumber}</strong>
              </div>

              {resolutionAction === 'Approved' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Choose Replacement Serial Number (Same Model) *
                    </label>
                    <button
                      type="button"
                      onClick={isScanning ? stopScanning : startScanning}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {isScanning ? 'Close Scanner' : 'Scan Serial'}
                    </button>
                  </div>

                  {isScanning && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-black flex items-center justify-center my-2">
                      <video ref={videoRef} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={stopScanning}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {fetchingStock ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      Fetching available stock...
                    </div>
                  ) : availableStock.length === 0 ? (
                    <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs">
                      No active, unsold stock of this model available in your inventory. You must add products of this model to approve.
                    </div>
                  ) : (
                    <select
                      value={newSerialNumber}
                      onChange={(e) => setNewSerialNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Choose a Serial Number --</option>
                      {availableStock.map((prod) => (
                        <option key={prod._id} value={prod.serialNumber}>
                          {prod.serialNumber}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">
                  Remarks / Notes
                </label>
                <textarea
                  placeholder="Reason for decision..."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeResolutionModal}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    resolving ||
                    (resolutionAction === 'Approved' &&
                      availableStock.length === 0 &&
                      !newSerialNumber)
                  }
                  className={`px-4 py-2 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    resolutionAction === 'Approved'
                      ? availableStock.length === 0 && !newSerialNumber
                        ? 'bg-emerald-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {resolving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : resolutionAction === 'Approved' ? (
                    'Approve & Assign'
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  Replacement Request Details
                </h3>
                <span className="text-xs text-gray-400">
                  ID: {viewRequest._id}
                </span>
              </div>
              <button
                onClick={() => setViewRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[11px] mb-1">
                    Defective Serial Number
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {viewRequest.oldSerialNumber}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[11px] mb-1">
                    Requester ({viewRequest.requesterModel})
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {viewRequest.requestedBy?.name || 'Unknown'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[11px] mb-1">
                    Reason
                  </span>
                  <span className="font-semibold text-gray-900">
                    {viewRequest.reason}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[11px] mb-1">
                    Created At
                  </span>
                  <span className="text-gray-700">
                    {new Date(viewRequest.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-medium block text-xs mb-1">
                  Description
                </span>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {viewRequest.description || 'No description provided.'}
                </p>
              </div>

              {/* Proof Images Gallery */}
              <div>
                <span className="text-gray-500 font-medium block text-xs mb-2">
                  Evidence Photos ({viewRequest.proofImages?.length || 0})
                </span>
                {viewRequest.proofImages && viewRequest.proofImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewRequest.proofImages.map((img, idx) => (
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={idx}
                        className="aspect-video rounded-lg overflow-hidden border border-gray-200 hover:opacity-95 block relative group shadow-xs"
                      >
                        <img
                          src={img}
                          alt={`Proof ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold gap-1 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" /> Open
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No evidence photos attached with this request.
                  </div>
                )}
              </div>

              {/* Resolution Info */}
              {viewRequest.status !== 'Pending' ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2 text-xs text-gray-700">
                  <div className="font-semibold flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      Resolution Status:{' '}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          viewRequest.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {viewRequest.status}
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {viewRequest.resolvedAt
                        ? new Date(viewRequest.resolvedAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                  {viewRequest.newSerialNumber && (
                    <p className="pt-1">
                      <strong>Replacement Serial:</strong>{' '}
                      <code className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {viewRequest.newSerialNumber}
                      </code>
                    </p>
                  )}
                  <p>
                    <strong>Admin Remarks:</strong>{' '}
                    {viewRequest.adminRemarks || 'N/A'}
                  </p>
                </div>
              ) : canResolve(viewRequest) ? (
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const r = viewRequest;
                      setViewRequest(null);
                      openResolutionModal(r, 'Rejected');
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Ban className="w-3.5 h-3.5" /> Reject Request
                  </button>
                  <button
                    onClick={() => {
                      const r = viewRequest;
                      setViewRequest(null);
                      openResolutionModal(r, 'Approved');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Assign Serial
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


