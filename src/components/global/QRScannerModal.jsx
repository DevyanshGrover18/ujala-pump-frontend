import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Scan } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';

const API_URL = import.meta.env.VITE_API_URL;

function QRScannerModal({
  isOpen,
  onClose,
  onProductUpdated,
  currentFactoryId,
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanError, setScanError] = useState(null);

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // --- Start camera and QR scanner ---
  const startCamera = async () => {
    try {
      if (!videoRef.current) return;

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          if (loading || productDetails || scanError) return;
          qrScannerRef.current.pause();

          try {
            const data = JSON.parse(result.data);
            await fetchProductDetails(data.serialNumber || result.data);
          } catch {
            await fetchProductDetails(result.data);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
    } catch (error) {
      console.error(error);
      toast.error('Camera access denied or unavailable.');
    }
  };

  // --- Stop and cleanup camera ---
  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // --- Fetch product by serial number ---
  const fetchProductDetails = async (serialNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/qr/${serialNumber}`);
      const data = response.data;

      if (
        currentFactoryId &&
        data.factory?.id &&
        String(data.factory.id) !== String(currentFactoryId)
      ) {
        setScanError('Scanned product belongs to a different factory.');
        toast.error('Scanned product belongs to a different factory.');
        return;
      }

      setProductDetails(data);
      stopCamera(); // stop camera after success
    } catch (error) {
      console.error(error);
      setScanError('Product not found or invalid QR code.');
      toast.error('Product not found or invalid QR code.');
    } finally {
      setLoading(false);
    }
  };

  // --- Manual search ---
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      fetchProductDetails(manualInput.trim());
    }
  };

  // --- Update product status ---
  const updateProductStatus = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/api/qr/${productDetails.serialNumber}/status`,
        {
          status: 'Dispatched',
        }
      );
      toast.success('Product marked as dispatched!');
      setProductDetails((prev) => ({ ...prev, status: 'Dispatched' }));
      onProductUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // --- Close Modal ---
  const handleClose = () => {
    stopCamera();
    setProductDetails(null);
    setManualInput('');
    setScanError(null);
    onClose();
  };

  // --- Handle modal open/close ---
  useEffect(() => {
    if (isOpen) startCamera();
    else {
      stopCamera();
      setProductDetails(null);
      setManualInput('');
      setScanError(null);
    }

    return () => stopCamera(); // cleanup on unmount
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">QR Scanner</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Scan Error */}
          {scanError && !productDetails && (
            <div className="text-center p-4">
              <p className="text-red-500 font-semibold">{scanError}</p>
              <button
                onClick={() => {
                  setScanError(null);
                  qrScannerRef.current?.start();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Scan Again
              </button>
            </div>
          )}

          {/* QR Scan / Manual Entry */}
          {!productDetails && !scanError && (
            <>
              {/* Camera */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                    <Scan className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Manual Input */}
              <div className="pt-2">
                <h3 className="font-medium mb-2">Or enter manually:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Serial number..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '...' : 'Search'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Product Details */}
          {productDetails && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Serial:</span>
                  <span className="font-medium">
                    {productDetails.serialNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-medium">{productDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{productDetails.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model:</span>
                  <span className="font-medium">
                    {productDetails.model?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      productDetails.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : productDetails.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {productDetails.status}
                  </span>
                </div>
              </div>

              {/* Dispatch Button */}
              {productDetails.status !== 'Dispatched' && (
                <button
                  onClick={updateProductStatus}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  Mark as Dispatched
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRScannerModal;
