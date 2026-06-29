import { useState, useRef, useEffect, useContext } from 'react';
import { Camera, X, CheckCircle, Scan } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { AuthContext } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_1 = import.meta.env.VITE_API_URL;

function SubDealerQRScannerModal({ isOpen, onClose, onProductScanned }) {
  const { user } = useContext(AuthContext);
  const [isScanning, setIsScanning] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const startCamera = async () => {
    try {
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            try {
              const data = JSON.parse(result.data);
              if (data.serialNumber) {
                fetchProductDetails(data.serialNumber);
              } else {
                fetchProductDetails(result.data);
              }
            } catch {
              fetchProductDetails(result.data);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        await qrScannerRef.current.start();
        setIsScanning(true);
      }
    } catch (error) {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // const fetchProductDetails = async (serialNumber) => {
  //     try {
  //         setLoading(true);
  //         // Check if this product is assigned to the sub-dealer
  //         // const response = await axios.get(`${API_URL}/api/dealer-subdealer-products/subdealer/my-products`, {

  //         const response = await axios.get(`${API_URL_1}/api/qr/sub-dealer/${serialNumber}`, {
  //             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  //         });

  //         const assignedProduct = response.data.find(p => p.product.serialNumber === serialNumber);
  //         console.log(assignedProduct);

  //         if (!assignedProduct) {
  //             toast.error('Product not found or not assigned to you');
  //             return;
  //         }

  //         if (assignedProduct.product.sold) {
  //             toast.error('Product already sold');
  //             return;
  //         }

  //         setProductDetails({
  //             ...assignedProduct.product,
  //             productName: assignedProduct.product.model?.name || assignedProduct.product.productName
  //         });
  //         stopCamera();
  //     } catch (error) {
  //         toast.error(error.response?.data?.message || 'Product not found');
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const fetchProductDetails = async (serialNumber) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL_1}/api/qr/sub-dealer/${serialNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log(response.data);

      const assignedProduct = response.data;

      if (!assignedProduct) {
        toast.error('Product not found or not assigned to you');
        return;
      }

      // Agar backend me sold/status ka logic hai
      // if (assignedProduct.status === 'Sold') {
      if (assignedProduct.status === 'Inactive') {
        toast.error('Product already sold');
        return;
      }

      setProductDetails({
        ...assignedProduct,
        productName: assignedProduct.model?.name || assignedProduct.category,
      });

      stopCamera();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      fetchProductDetails(manualInput.trim());
    }
  };

  const handleSellProduct = () => {
    onProductScanned(productDetails);
  };

  const handleClose = () => {
    stopCamera();
    setProductDetails(null);
    setManualInput('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setProductDetails(null);
      setManualInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Scan Product to Sell</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!productDetails ? (
            <>
              <div className="text-center">
                <div className="space-y-3">
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
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-medium mb-2">Or enter manually:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Serial number..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleManualSubmit()
                    }
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
          ) : (
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
                  <span className="text-gray-500">Model:</span>
                  <span className="font-medium">
                    {productDetails.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      productDetails.sold
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {productDetails.sold ? 'Sold' : 'Available'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSellProduct}
                disabled={loading || productDetails.sold}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                Sell Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubDealerQRScannerModal;
