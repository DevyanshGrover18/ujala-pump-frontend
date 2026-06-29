import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export default function DistributorSelectionModal({
  isOpen,
  onClose,
  onAssign,
}) {
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDistributors();
    }
  }, [isOpen]);

  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/distributors`);
      setDistributors(response.data);
    } catch (error) {
      toast.error('Error fetching distributors');
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = () => {
    if (selectedDistributor) {
      onAssign(selectedDistributor);
    } else {
      toast.error('Please select a distributor');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Select Distributor</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading distributors...</p>
            </div>
          ) : distributors.length === 0 ? (
            <p className="text-center text-gray-500">No distributors found.</p>
          ) : (
            <div className="space-y-2">
              {distributors.map((distributor) => (
                <label
                  key={distributor._id}
                  className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="distributor"
                    value={distributor._id}
                    checked={selectedDistributor === distributor._id}
                    onChange={() => setSelectedDistributor(distributor._id)}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {distributor.name}
                  </span>
                  {distributor.productCount !== undefined && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {distributor.productCount} products
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex flex-col xl:flex-row justify-end space-y-2 xl:space-y-0 xl:space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignClick}
            disabled={!selectedDistributor || loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedDistributor && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
