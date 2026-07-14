import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Wrench,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  Calendar,
  X,
  QrCode,
} from 'lucide-react';
import ComplaintModal from './components/ComplaintModal';
import PlumberQRScannerModal from './components/PlumberQRScannerModal';
import InstallationModal from './components/InstallationModal';

const API = import.meta.env.VITE_API_URL;

export default function PlumberInstallation() {
  const { user } = useContext(AuthContext);
  
  // Search & Verify states
  const [serialInput, setSerialInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedProduct, setVerifiedProduct] = useState(null);
  const [installError, setInstallError] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Complaint states
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [complaintMotorDetails, setComplaintMotorDetails] = useState(null);

  // History states
  const [installations, setInstallations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/installations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInstallations(res.data);
    } catch (error) {
      console.error('Error fetching installations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleVerify = async (e, directSerial) => {
    if (e) e.preventDefault();
    const targetSerial = directSerial || serialInput;
    if (!targetSerial.trim()) return;

    setVerifying(true);
    setInstallError(null);
    setVerifiedProduct(null);

    if (directSerial) {
      setSerialInput(directSerial);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/installations/check/${targetSerial.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVerifiedProduct(res.data.product);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.alreadyInstalled) {
        setInstallError({
          type: 'alreadyInstalled',
          message: errorData.message || 'Motor already installed.',
        });
        setComplaintMotorDetails(errorData.product);
      } else {
        setInstallError({
          type: 'notFound',
          message: errorData?.message || 'Product serial number not found.',
        });
      }
    } finally {
      setVerifying(false);
    }
  };



  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Motor Installation Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scan QR code or enter motor serial number to log an installation.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Serial Input and Verification */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 w-full">
          <h2 className="text-md font-bold text-gray-900">Verify Motor</h2>

          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label htmlFor="serialInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Motor Serial Number
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="serialInput"
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  placeholder="Enter Serial Number"
                  className="flex-grow min-w-0 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5b189b] focus:border-transparent font-mono text-sm uppercase"
                  disabled={verifying}
                  required
                />
                {!serialInput.trim() ? (
                  <button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    disabled={verifying}
                    className="flex-shrink-0 bg-[#5b189b] hover:bg-[#431075] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan QR</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-shrink-0 bg-[#5b189b] hover:bg-[#431075] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-sm shadow-sm"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Verification Results */}
          {installError && (
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                installError.type === 'alreadyInstalled'
                  ? 'bg-rose-50 border-rose-100 text-rose-800'
                  : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}
            >
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">Verification Failed</h3>
                  <p className="text-xs mt-0.5">{installError.message}</p>
                </div>
              </div>

              {installError.type === 'alreadyInstalled' && (
                <button
                  type="button"
                  onClick={() => setIsComplaintOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  File Double-Registration Complaint
                </button>
              )}
            </div>
          )}

          {verifiedProduct && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Motor Verified</h3>
                <p className="text-xs mt-0.5 font-mono">{verifiedProduct.serialNumber} is ready for installation.</p>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Installed Motors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">My Installed Motors</h2>
        <p className="text-xs text-gray-500 mb-6">Historical record of all motor installations logged by you.</p>

        {loadingHistory ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b189b]"></div>
          </div>
        ) : installations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-semibold">No installations registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3">Serial Number</th>
                  <th className="py-3">Model Name</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Geolocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {installations.map((inst) => (
                  <tr key={inst._id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-mono font-bold text-gray-900">{inst.serialNumber}</td>
                    <td className="py-4">{inst.model?.name || 'N/A'}</td>
                    <td className="py-4 text-xs text-gray-500">
                      {new Date(inst.installationDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#5b189b]" />
                        {inst.geolocation?.latitude?.toFixed(6)}, {inst.geolocation?.longitude?.toFixed(6)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plumber QR Scanner Modal */}
      <PlumberQRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={(serial) => handleVerify(null, serial)}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintOpen}
        onClose={() => setIsComplaintOpen(false)}
        serialNumber={serialInput}
        motorDetails={complaintMotorDetails}
        onComplaintRegistered={() => {
          setSerialInput('');
          setInstallError(null);
        }}
      />

      {/* Installation Modal */}
      <InstallationModal
        isOpen={!!verifiedProduct}
        onClose={() => setVerifiedProduct(null)}
        verifiedProduct={verifiedProduct}
        user={user}
        onSuccess={() => {
          setSerialInput('');
          fetchHistory();
        }}
      />
    </div>
  );
}
