import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;

export default function ComplaintModal({
  isOpen,
  onClose,
  serialNumber,
  motorDetails,
  onComplaintRegistered,
}) {
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/api/complaints`,
        {
          serialNumber,
          motorDetails,
          additionalDetails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Complaint registered successfully.');
      setAdditionalDetails('');
      if (onComplaintRegistered) {
        onComplaintRegistered();
      }
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to register complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg">Register Double-Registration Complaint</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Serial Number
            </label>
            <input
              type="text"
              readOnly
              value={serialNumber}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Motor Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-gray-400">Category:</span>{' '}
                <span className="font-semibold text-gray-700">{motorDetails?.categoryName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Model Name:</span>{' '}
                <span className="font-semibold text-gray-700">{motorDetails?.modelName || 'N/A'}</span>
              </div>
              {motorDetails?.specifications && (
                <>
                  <div>
                    <span className="text-gray-400">KW/HP:</span>{' '}
                    <span className="font-semibold text-gray-700">
                      {motorDetails.specifications.kwHp || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Voltage:</span>{' '}
                    <span className="font-semibold text-gray-700">
                      {motorDetails.specifications.voltage || 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1" htmlFor="additionalDetails">
              Additional Details (Optional)
            </label>
            <textarea
              id="additionalDetails"
              rows={4}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Provide extra details about the installation, site, customer, or merchant..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-shadow duration-200 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Register Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
