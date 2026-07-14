import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Calendar,
  MessageSquare,
  Wrench,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const STATUS_BADGE = {
  Open: 'bg-rose-50 text-rose-700 border border-rose-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const STATUS_ICON = {
  Open: Clock,
  Resolved: CheckCircle2,
};

export default function PlumberComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching plumber complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Complaints Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            View double-registration complaints registered for motor serial numbers.
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b189b]"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#5b189b]" />
            <p className="text-sm font-semibold">No complaints registered.</p>
            <p className="text-xs mt-1">Complaints appear here if you report already-installed serial numbers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3">Serial Number</th>
                  <th className="py-3">Motor Specs</th>
                  <th className="py-3">Complaint Details</th>
                  <th className="py-3">Reported Date</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {complaints.map((complaint) => {
                  const StatusIcon = STATUS_ICON[complaint.status] || Clock;

                  return (
                    <tr key={complaint._id} className="hover:bg-gray-50/50">
                      <td className="py-4 font-mono font-bold text-gray-900">
                        {complaint.serialNumber}
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-gray-700 block">
                          {complaint.motorDetails?.modelName || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {complaint.motorDetails?.categoryName || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 max-w-xs">
                        {complaint.additionalDetails ? (
                          <div className="flex gap-1.5 items-start text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <MessageSquare className="w-4 h-4 text-[#5b189b] flex-shrink-0 mt-0.5" />
                            <p className="line-clamp-2" title={complaint.additionalDetails}>
                              {complaint.additionalDetails}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No additional details</span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(complaint.complaintDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_BADGE[complaint.status]
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {complaint.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
