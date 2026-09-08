import { useState, useRef, useEffect } from 'react';
import { X, Scan } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QrScanner from 'qr-scanner';

export default function PlumberQRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const lastScannedRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  const startCamera = async () => {
    try {
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            try {
              let raw = result.data;
              let candidate;
              try {
                const parsed = JSON.parse(raw);
                candidate = parsed.serialNumber || parsed.serial || parsed.sn || raw;
              } catch {
                candidate = raw;
              }

              const normalize = (s) => {
                if (s === null || s === undefined) return '';
                return String(s)
                  .replace(/[\u0000-\u001F\u007F-\u009F\uFEFF]/g, '')
                  .trim()
                  .toUpperCase();
              };

              const serial = normalize(candidate);
              if (!serial) return;

              // Debounce / dedupe identical scans within short window
              if (lastScannedRef.current === serial) return;
              lastScannedRef.current = serial;
              if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
              scanTimeoutRef.current = setTimeout(() => {
                lastScannedRef.current = null;
              }, 2500);

              handleScanComplete(serial);
            } catch (err) {
              console.error('Error handling QR result', err);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        await qrScannerRef.current.start();
      }
    } catch (error) {
      toast.error('Camera access denied or unavailable');
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleScanComplete = (serial) => {
    onScanSuccess(String(serial || '').trim().toUpperCase());
    handleClose();
  };

  const handleManualSubmit = () => {
    const normalized = String(manualInput || '')
      .replace(/[\u0000-\u001F\u007F-\u009F\uFEFF]/g, '')
      .trim()
      .toUpperCase();
    if (normalized) {
      handleScanComplete(normalized);
    }
  };

  const handleClose = () => {
    stopCamera();
    setManualInput('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setManualInput('');
    }
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#5b189b]" />
            <h2 className="text-base font-bold text-gray-800">Scan Product QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="relative aspect-square max-w-[260px] mx-auto bg-black rounded-2xl overflow-hidden shadow-inner ring-4 ring-gray-50">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 border-2 border-white border-dashed rounded-2xl flex items-center justify-center">
                  <Scan className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold uppercase">Or enter manually</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Enter Serial Number"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5b189b] focus:border-transparent font-mono text-sm uppercase"
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              onClick={handleManualSubmit}
              className="px-5 py-2 bg-[#5b189b] hover:bg-[#431075] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
