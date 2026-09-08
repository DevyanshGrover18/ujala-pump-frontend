import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  RotateCcw,
  AlertCircle,
  Package,
  IndianRupee,
  Calendar,
  Send,
  FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function ReapplyIncentiveModal({ claim, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!claim) return null;

  const representativeItem = claim.items?.[0] || {};
  const itemCount = claim.items?.length || 1;
  const serialNumber = representativeItem.serialNumber || claim.serialNumber || 'N/A';
  const modelName = representativeItem.model?.name || claim.modelName || representativeItem.modelName || 'Product';
  const rejectionReason = claim.rejectionReason || claim.previousRejectionReason || 'Claim details need verification';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/api/incentives/${claim._id}/reapply`,
        { notes: notes.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Trigger instant real-time sync across sidebars and dashboard
      window.dispatchEvent(new Event('incentives-updated'));

      toast.success(res.data?.message || 'Incentive claim resubmitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error reapplying for incentive claim:', err);
      setError(err?.response?.data?.message || 'Failed to resubmit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Clean Professional Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Reapply for Incentive Claim
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Resubmit your claim for review and verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Subdued Rejection Alert */}
          <div className="p-3.5 bg-red-50/60 border border-red-200/70 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-900">Reason for Rejection:</p>
              <p className="text-red-800 mt-0.5 leading-relaxed font-medium">
                {rejectionReason}
              </p>
            </div>
          </div>

          {/* Neutral Claim Summary Details */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                Product / Serial
              </span>
              <span className="font-mono font-bold text-gray-900">
                {itemCount > 1 ? `${serialNumber} (+${itemCount - 1} items)` : serialNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Model</span>
              <span className="font-semibold text-gray-800">{modelName}</span>
            </div>

            {typeof claim.totalIncentive === 'number' && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                  Incentive Amount
                </span>
                <span className="font-bold text-gray-900 font-mono text-sm">
                  ₹{claim.totalIncentive.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Points system commented out
            {typeof claim.totalPoints === 'number' && claim.totalPoints > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Points</span>
                <span className="font-bold text-gray-800 font-mono">
                  {claim.totalPoints.toLocaleString('en-IN')} pts
                </span>
              </div>
            )}
            */}

            {claim.claimDate && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-gray-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  Claim Date:
                </span>
                <span>{new Date(claim.claimDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Clarification / Correction Notes</span>
              <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any explanation or mention attached corrections..."
              className="w-full px-3.5 py-2.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${submitting ? 'animate-pulse' : ''}`} />
              <span>{submitting ? 'Submitting...' : 'Submit & Reapply'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
