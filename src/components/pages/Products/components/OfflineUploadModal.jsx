import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export default function OfflineUploadModal({
  isOpen,
  onClose,
  onSuccess,
  models,
  factories,
}) {
  const [selectedFactory, setSelectedFactory] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [serialNumbersText, setSerialNumbersText] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSelectedFactory('');
    setSelectedModel('');
    setSerialNumbersText('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUploadClick = async () => {
    if (!selectedFactory || !selectedModel || !serialNumbersText.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    // Parse serial numbers: split by comma or newline, trim whitespace, remove empty
    const serialsArray = serialNumbersText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (serialsArray.length === 0) {
      toast.error('Please enter at least one valid serial number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/products/offline`, {
        factoryId: selectedFactory,
        modelId: selectedModel,
        serialNumbers: serialsArray,
      }, {
        withCredentials: true
      });
      
      toast.success(response.data.message || `Successfully uploaded ${response.data.count} products.`);
      onSuccess();
      handleClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error uploading products');
      }
      console.error('Error uploading offline products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Upload Offline Products</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factory
            </label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select Factory</option>
              {factories.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select Model</option>
              {models.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Numbers
            </label>
            <textarea
              value={serialNumbersText}
              onChange={(e) => setSerialNumbersText(e.target.value)}
              placeholder="Enter serial numbers separated by commas or new lines..."
              rows={6}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 resize-y text-sm font-mono"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
             Separate multiple serial numbers with a comma or place them on a new line.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg sticky bottom-0">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={loading || !selectedFactory || !selectedModel || !serialNumbersText.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
