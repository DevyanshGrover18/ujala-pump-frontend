import { useState, useRef, useEffect, useContext } from 'react';
import { Camera, X, CheckCircle, RefreshCw, Loader2, Upload, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { AuthContext } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function ReplacementRequests() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token') || user?.token;

  // List of replacements state
  const [replacements, setReplacements] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Form state
  const [serialNumber, setSerialNumber] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [proofImages, setProofImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Camera QR scanner state
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    fetchReplacements();
  }, []);

  const fetchReplacements = async () => {
    try {
      setListLoading(true);
      const res = await axios.get(`${API_URL}/api/replacements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplacements(res.data);
    } catch (err) {
      console.error('Error fetching replacements:', err);
      toast.error('Failed to load replacement history');
    } finally {
      setListLoading(false);
    }
  };

  const handleVerifySerialNumber = async (e) => {
    if (e) e.preventDefault();
    if (!serialNumber.trim()) {
      return toast.error('Please enter a serial number');
    }

    try {
      setVerifying(true);
      setVerifiedProduct(null);
      const res = await axios.get(
        `${API_URL}/api/replacements/verify/${encodeURIComponent(serialNumber.trim())}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVerifiedProduct(res.data.product);
      toast.success('Product verified successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // QR Scanning functions
  const startScanning = async () => {
    setIsScanning(true);
    // Wait for video element to mount
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
                setSerialNumber(cleaned);
                stopScanning();
                // Auto trigger verification
                triggerAutoVerify(cleaned);
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

  const triggerAutoVerify = async (scannedSerial) => {
    try {
      setVerifying(true);
      setVerifiedProduct(null);
      const res = await axios.get(
        `${API_URL}/api/replacements/verify/${encodeURIComponent(scannedSerial)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVerifiedProduct(res.data.product);
      toast.success('Product verified successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Handle Image upload and convert to base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 2MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!verifiedProduct) {
      return toast.error('Please verify product serial number first');
    }
    if (!reason.trim()) {
      return toast.error('Please select or specify a reason');
    }
    if (proofImages.length === 0) {
      return toast.error('Please upload at least one proof image');
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/api/replacements`,
        {
          serialNumber: verifiedProduct.serialNumber,
          reason,
          description,
          proofImages,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Replacement request submitted successfully!');
      // Reset form
      setSerialNumber('');
      setVerifiedProduct(null);
      setReason('');
      setDescription('');
      setProofImages([]);
      // Refresh list
      fetchReplacements();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit replacement request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Replacements</h1>
          <p className="text-gray-500 text-sm">Submit and track product replacement requests.</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col gap-8">
        
        {/* Left Side: Submit Form */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-950 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            New Request
          </h2>

          {/* Step 1: Scan or Type Serial */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Step 1: Verify Serial Number
            </label>

            {isScanning ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-black flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={stopScanning}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Serial Number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  disabled={verifying}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={startScanning}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                  title="Scan QR Code"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleVerifySerialNumber}
                  disabled={verifying}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center min-w-[70px]"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </button>
              </div>
            )}
          </div>

          {/* Verified Product Info */}
          {verifiedProduct && (
            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Product Verified
              </div>
              <div className="text-xs space-y-1 text-gray-600">
                <p><strong>Name:</strong> {verifiedProduct.productName}</p>
                <p><strong>Serial:</strong> {verifiedProduct.serialNumber}</p>
                <p><strong>Model:</strong> {verifiedProduct.model?.name}</p>
              </div>
            </div>
          )}

          {/* Step 2: Form Fields */}
          {verifiedProduct && (
            <form onSubmit={handleSubmitRequest} className="space-y-4 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Step 2: Enter Defect Details
              </label>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Reason for Replacement *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Manufacturing Defect">Manufacturing Defect</option>
                  <option value="Dead on Arrival">Dead on Arrival (DOA)</option>
                  <option value="Winding Issue">Winding Burned/Damaged</option>
                  <option value="Physical Damage">Physical Damage on Transit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Provide additional details about the defect..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Upload Evidence Photos *</label>
                <div className="grid grid-cols-3 gap-2">
                  {proofImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-gray-100 overflow-hidden group">
                      <img src={img} alt="proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {proofImages.length < 3 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400">
                      <Upload className="w-5 h-5" />
                      <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">Upload up to 3 images showing the defect (Max 2MB each).</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Request History */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-950">Request History</h2>

          {listLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : replacements.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No replacement requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium text-xs uppercase">
                    <th className="pb-3">Defective Serial</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Request Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Replacement Serial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {replacements.map((item) => (
                    <tr key={item._id} className="text-gray-700 hover:bg-gray-50/50">
                      <td className="py-4 font-mono font-medium">{item.oldSerialNumber}</td>
                      <td className="py-4">{item.reason}</td>
                      <td className="py-4 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : item.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono">
                        {item.status === 'Approved' ? (
                          <span className="text-emerald-700 font-semibold">{item.newSerialNumber || 'N/A'}</span>
                        ) : item.status === 'Rejected' ? (
                          <span className="text-gray-400 line-through">N/A</span>
                        ) : (
                          <span className="text-gray-400 italic">Awaiting Admin</span>
                        )}
                        {item.adminRemarks && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Remark: {item.adminRemarks}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
