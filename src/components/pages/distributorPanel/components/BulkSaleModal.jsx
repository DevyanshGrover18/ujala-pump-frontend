import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Trash2, QrCode, Loader2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import QrScanner from 'qr-scanner';

const API_URL = import.meta.env.VITE_API_URL;

const BulkSaleModal = ({ isOpen, onClose, fetchSalesData, dealers }) => {
  const [selectedDealer, setSelectedDealer] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const isProcessing = useRef(false);

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const scannedSet = useRef(new Set());

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => result.data && handleValidateProduct(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
        }
      );
      await qrScannerRef.current.start();
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleValidateProduct = async (scannedResult) => {
    if (isProcessing.current) return;

    let cleanSerial = '';

    try {
      isProcessing.current = true;

      if (typeof scannedResult === 'string' && scannedResult.startsWith('{')) {
        const parsedData = JSON.parse(scannedResult);
        cleanSerial = (
          parsedData.serialNumber ||
          parsedData.serial ||
          parsedData.id ||
          ''
        )
          .toString()
          .trim();
      } else if (typeof scannedResult === 'object') {
        cleanSerial = (
          scannedResult.serialNumber ||
          scannedResult.serial ||
          scannedResult.id ||
          ''
        )
          .toString()
          .trim();
      } else {
        cleanSerial = scannedResult?.toString().trim();
      }

      if (!cleanSerial) {
        isProcessing.current = false;
        return;
      }

      const serialKey = cleanSerial.toLowerCase();

      if (scannedSet.current.has(serialKey)) {
        toast.error(`Already added: ${cleanSerial}`, { id: serialKey });
        isProcessing.current = false;
        return;
      }

      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/qr/distributor/${cleanSerial}`
      );
      const product = response.data;

      if (product.sold) {
        toast.error('Product already sold!');
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      scannedSet.current.add(serialKey);

      setScannedItems((prev) => [
        {
          orderId: product.orderId,
          serialNumber: product.serialNumber,
          model: product.model?.name || 'N/A',
          modelId: product.model?._id || '',
          factoryId: product.factory?.id || '',
          orderType: product.orderType || '',
        },
        ...prev,
      ]);

      setManualInput('');
      toast.success(`Added: ${product.serialNumber}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  const clearList = () => {
    setScannedItems([]);
    scannedSet.current.clear();
  };

  const handleSubmit = async () => {
    if (!selectedDealer) return toast.error('Please select a dealer');
    if (scannedItems.length === 0) return toast.error('No products to submit');

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/sales/bulk-dispatch-distributor`, {
        dealerId: selectedDealer,
        products: scannedItems.map((item) => ({
          orderId: item.orderId,
          serialNumber: item.serialNumber,
          modelId: item.modelId,
          factoryId: item.factoryId,
          orderType: item.orderType,
        })),
      });

      toast.success(`Dispatched ${scannedItems.length} products`);
      fetchSalesData();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setScannedItems([]);
    scannedSet.current.clear();
    setSelectedDealer('');
    setManualInput('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => startCamera(), 500);
      return () => clearTimeout(timer);
    } else stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 border-b flex justify-between items-center shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <QrCode className="text-white h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Bulk Dispatch
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel: Scanner & Controls */}
          <div className="w-full lg:w-[320px] p-4 border-b lg:border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0 overflow-y-auto max-h-[45vh] lg:max-h-full">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                  Dealer
                </label>
                <select
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedDealer}
                  onChange={(e) => setSelectedDealer(e.target.value)}
                >
                  <option value="">Select Dealer...</option>
                  {dealers?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scanner */}
              <div className="relative aspect-video lg:aspect-square max-h-[180px] lg:max-h-none bg-black rounded-xl overflow-hidden shadow-inner border-2 border-white ring-1 ring-slate-200">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl text-sm font-mono focus:border-indigo-500 outline-none uppercase"
                  placeholder="Serial..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleValidateProduct(manualInput)
                  }
                />
                <button
                  onClick={() => handleValidateProduct(manualInput)}
                  className="bg-slate-800 text-white px-4 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Scanned List */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="px-6 py-2 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Scanned Queue ({scannedItems.length})
              </span>
              {scannedItems.length > 0 && (
                <button
                  onClick={clearList}
                  className="text-[11px] text-red-500 font-bold hover:underline"
                >
                  Clear List
                </button>
              )}
            </div>

            {/* Scrolling Table Area */}
            <div className="flex-1 overflow-auto">
              {scannedItems.length > 0 ? (
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr>
                      <th className="p-3 text-left font-bold text-slate-400 text-[10px] uppercase border-b">
                        Model
                      </th>
                      <th className="p-3 text-left font-bold text-slate-400 text-[10px] uppercase border-b">
                        Serial
                      </th>
                      <th className="p-3 text-center border-b w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {scannedItems.map((item) => (
                      <tr
                        key={item.serialNumber}
                        className="animate-in slide-in-from-left-2 duration-200"
                      >
                        <td className="p-3 font-semibold text-slate-700 max-w-[120px] truncate">
                          {item.model}
                        </td>
                        <td className="p-3 font-mono text-indigo-600 text-xs">
                          {item.serialNumber}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setScannedItems((prev) =>
                                prev.filter(
                                  (p) => p.serialNumber !== item.serialNumber
                                )
                              );
                              scannedSet.current.delete(
                                item.serialNumber.toLowerCase()
                              );
                            }}
                            className="p-1.5 text-slate-300 hover:text-red-500 active:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8">
                  <Package size={40} className="mb-2 opacity-20" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    Awaiting Scans
                  </p>
                </div>
              )}
            </div>

            {/* Fixed Bottom Action Area */}
            <div className="p-4 bg-white border-t shrink-0">
              <button
                disabled={
                  !selectedDealer || scannedItems.length === 0 || submitting
                }
                onClick={handleSubmit}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-[0.98]"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <CheckCircle size={18} />
                )}
                <span className="uppercase text-xs tracking-widest">
                  Dispatch {scannedItems.length} Products
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSaleModal;