import { useState, useRef, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Camera, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function InstallationModal({
  isOpen,
  onClose,
  verifiedProduct,
  user,
  onSuccess,
}) {
  const [locationCoords, setLocationCoords] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && verifiedProduct) {
      setLocationCoords(null);
      setCapturedImage(null);
      setSubmitting(false);
      triggerGetLocation();
    }
  }, [isOpen, verifiedProduct]);

  const triggerGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setFetchingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not fetch geolocation. Please allow location permissions.');
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationCoords) {
      toast.error('Geolocation coordinates are required. Please click "Fetch Location" if needed.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/api/installations`,
        {
          serialNumber: verifiedProduct.serialNumber,
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
          image: capturedImage, // Base64 image upload
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Motor installation registered successfully.');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error submitting installation:', error);
      toast.error(error.response?.data?.message || 'Failed to submit installation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !verifiedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl flex flex-col w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Installation Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 scrollbar-hide flex-1">
            
            {/* Grid for Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plumber Details */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Installer Profile</h3>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-400">Name:</span> <span className="font-semibold text-gray-700">{user?.plumber?.name || user?.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span> <span className="font-semibold text-gray-700">{user?.plumber?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ID:</span> <span className="font-semibold text-[#5b189b] font-mono">{user?.plumber?.plumberId}</span>
                  </div>
                </div>
              </div>

              {/* Motor Details */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Motor Specifications</h3>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-400">Serial No:</span> <span className="font-semibold text-gray-700 font-mono">{verifiedProduct.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Model Name:</span> <span className="font-semibold text-gray-700">{verifiedProduct.modelName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span> <span className="font-semibold text-gray-700">{verifiedProduct.categoryName || 'N/A'}</span>
                  </div>
                  {verifiedProduct.specifications && (
                    <div>
                      <span className="text-gray-400">KW/HP:</span> <span className="font-semibold text-gray-700">{verifiedProduct.specifications.kwHp || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Geolocation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Geolocation Tracker *</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  type="button"
                  onClick={triggerGetLocation}
                  disabled={fetchingLocation}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-xs border border-gray-200 shadow-sm"
                >
                  {fetchingLocation ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Fetching GPS...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-[#5b189b]" /> Fetch Location Coordinates
                    </>
                  )}
                </button>

                {locationCoords ? (
                  <div className="text-xs text-gray-600 bg-purple-50 border border-purple-100 rounded-lg py-2 px-3 font-mono">
                    LAT: <span className="font-bold">{locationCoords.latitude.toFixed(6)}</span> | LON:{' '}
                    <span className="font-bold">{locationCoords.longitude.toFixed(6)}</span>
                  </div>
                ) : (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> GPS coordinates required.
                  </span>
                )}
              </div>
            </div>

            {/* Optional Camera Capture */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Motor Installation Image (Optional)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleImageCapture}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-xs border border-gray-200 border-dashed w-32 h-24 shadow-sm"
                >
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span>Capture Photo</span>
                </button>

                {capturedImage && (
                  <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                    <img src={capturedImage} alt="Capture preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                * Note: Photo is captured and uploaded securely to register your installation.
              </p>
            </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !locationCoords}
              className="px-5 py-2 bg-[#5b189b] hover:bg-[#431075] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Registering...' : 'Complete Installation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
