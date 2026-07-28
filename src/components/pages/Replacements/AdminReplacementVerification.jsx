import { useState, useEffect, useRef, useContext } from 'react';
import { Camera, X, CheckCircle, RefreshCw, Loader2, Check, Ban, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { AuthContext } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminReplacementVerification() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token') || user?.token;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');

  // Modal / Resolution state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionAction, setResolutionAction] = useState(null); // 'Approve' or 'Reject'
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  // QR scanner state for scanning new replacement
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Detail viewer modal
  const [viewRequest, setViewRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/replacements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
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

  const openResolutionModal = (req, action) => {
    setSelectedRequest(req);
    setResolutionAction(action);
    setNewSerialNumber('');
    setAdminRemarks('');
  };

  const closeResolutionModal = () => {
    setSelectedRequest(null);
    setResolutionAction(null);
    stopScanning();
  };

  const filteredRequests = requests.filter((r) => r.status === statusFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Replacement Queue</h1>
          <p className="text-gray-500 text-sm">Review, verify, and resolve product replacement requests.</p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        {['Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              statusFilter === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {status} ({requests.filter((r) => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Grid of requests */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          No {statusFilter.toLowerCase()} replacement requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image Banner */}
              {req.proofImages && req.proofImages[0] ? (
                <div className="h-40 bg-gray-50 relative overflow-hidden group">
                  <img
                    src={req.proofImages[0]}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setViewRequest(req)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              ) : (
                <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                  No image attached
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {req.requesterModel}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-mono text-sm font-semibold text-gray-900">
                    Defective SN: {req.oldSerialNumber}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium">
                    <strong>Reason:</strong> {req.reason}
                  </p>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {req.description || 'No description provided'}
                  </p>
                </div>

                {/* Requester Info */}
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex justify-between items-center">
                  <div>
                    <strong>Requested By:</strong> {req.requestedBy?.name || 'Unknown'}
                  </div>
                  
                  {/* Actions for Pending */}
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openResolutionModal(req, 'Rejected')}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-100"
                        title="Reject Request"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openResolutionModal(req, 'Approved')}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-100"
                        title="Approve Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Resolution Details for Resolved */}
                  {req.status === 'Approved' && (
                    <div className="text-emerald-700 font-medium font-mono text-[11px]">
                      New SN: {req.newSerialNumber}
                    </div>
                  )}
                  {req.status === 'Rejected' && (
                    <div className="text-rose-700 font-medium text-[11px]">
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base">
                {resolutionAction === 'Approved' ? 'Approve Replacement' : 'Reject Request'}
              </h3>
              <button onClick={closeResolutionModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div className="text-xs text-gray-500">
                Resolving request for defective serial number: <strong>{selectedRequest.oldSerialNumber}</strong>
              </div>

              {resolutionAction === 'Approved' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Scan or Enter Replacement Serial Number *
                  </label>

                  {isScanning ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-black flex items-center justify-center">
                      <video ref={videoRef} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={stopScanning}
                        className="absolute top-2 right-2 p-1 bg-white/90 text-gray-800 rounded-full hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Replacement Serial Number"
                        value={newSerialNumber}
                        onChange={(e) => setNewSerialNumber(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={startScanning}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                        title="Scan New QR"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeResolutionModal}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 ${
                    resolutionAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base">Replacement Request Details</h3>
              <button onClick={() => setViewRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs">Defective Serial Number</span>
                  <span className="font-mono font-semibold text-gray-900">{viewRequest.oldSerialNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Requester ({viewRequest.requesterModel})</span>
                  <span className="font-semibold text-gray-900">{viewRequest.requestedBy?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Reason</span>
                  <span className="font-medium text-gray-950">{viewRequest.reason}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Created At</span>
                  <span>{new Date(viewRequest.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Description</span>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {viewRequest.description || 'No description provided.'}
                </p>
              </div>

              {/* Proof Images Gallery */}
              <div>
                <span className="text-gray-400 block text-xs mb-2">Evidence Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {viewRequest.proofImages?.map((img, idx) => (
                    <a
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={idx}
                      className="aspect-video rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 block relative group"
                    >
                      <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold">
                        Open in New Tab
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {viewRequest.status !== 'Pending' && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2 text-sm text-gray-700">
                  <div className="font-semibold flex justify-between">
                    <span>Resolution: {viewRequest.status}</span>
                    <span className="text-xs text-gray-400">{viewRequest.resolvedAt ? new Date(viewRequest.resolvedAt).toLocaleString() : ''}</span>
                  </div>
                  {viewRequest.newSerialNumber && (
                    <p><strong>Replacement Serial:</strong> <code className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">{viewRequest.newSerialNumber}</code></p>
                  )}
                  <p><strong>Admin Remarks:</strong> {viewRequest.adminRemarks || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
