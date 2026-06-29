import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import axios from 'axios';

// Simple debounce function
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export default function ModelModal({
  isOpen,
  onClose,
  onSave,
  model,
  isEditing,
  categories,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    specifications: {
      grossWeight: '',
      kwHp: '',
      voltage: '220V',
      mrpPrice: '',
    },
    warranty: [],
    status: 'Active',
    incentive: 0,
    points: 0,
  });
  const [codeError, setCodeError] = useState('');
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState({});

  const fetchStates = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/locations/states`
      );
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchDistricts = async (state) => {
    if (!state) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/locations/districts/${state}`
      );
      setDistricts((prev) => ({ ...prev, [state]: response.data }));
    } catch (error) {
      console.error(`Error fetching districts for ${state}:`, error);
    }
  };

  const addWarranty = () => {
    setFormData((prev) => ({
      ...prev,
      warranty: [
        ...prev.warranty,
        { state: '', city: '', durationType: 'Months', duration: '' },
      ],
    }));
  };

  const removeWarranty = (index) => {
    setFormData((prev) => ({
      ...prev,
      warranty: prev.warranty.filter((_, i) => i !== index),
    }));
  };

  const handleWarrantyChange = (index, field, value) => {
    const newWarranty = [...formData.warranty];
    newWarranty[index][field] = value;
    if (field === 'state') {
      newWarranty[index]['city'] = ''; // Reset city when state changes
      fetchDistricts(value);
    }
    setFormData((prev) => ({ ...prev, warranty: newWarranty }));
  };

  const checkCodeUniqueness = useCallback(
    debounce(async (code) => {
      if (!code || isEditing) {
        // Don't check uniqueness if editing or code is empty
        setCodeError('');
        setIsCheckingCode(false);
        return;
      }
      setIsCheckingCode(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/models/check-code/${code}`
        );
        if (!response.data.isUnique) {
          setCodeError('This code is already in use.');
        } else {
          setCodeError('');
        }
      } catch (error) {
        console.error('Error checking code uniqueness:', error);
        setCodeError('Error checking code uniqueness.');
      } finally {
        setIsCheckingCode(false);
      }
    }, 500),
    [isEditing]
  );

  useEffect(() => {
    if (isOpen) {
      fetchStates();
      if (isEditing && model) {
        setFormData({
          name: model.name || '',
          code: model.code || '',
          category: model.category?._id || '',
          specifications: {
            grossWeight: model.specifications?.grossWeight || '',
            kwHp: model.specifications?.kwHp || '',
            voltage: model.specifications?.voltage || '220V',
            mrpPrice: model.specifications?.mrpPrice || '',
          },
          warranty: model.warranty || [],
          status: model.status || 'Active',
          incentive: model.incentive ?? 0,
          points: model.points ?? 0,
        });
        // Pre-fetch districts for warranty entries so city select shows current value
        if (Array.isArray(model.warranty)) {
          const uniqueStates = Array.from(
            new Set(model.warranty.map((w) => w.state).filter(Boolean))
          );
          uniqueStates.forEach((s) => fetchDistricts(s));
        }
        setCodeError('');
      } else {
        setFormData({
          name: '',
          code: '',
          category: '',
          specifications: {
            grossWeight: '',
            kwHp: '',
            voltage: '220V',
            mrpPrice: '',
          },
          warranty: [],
          status: 'Active',
          incentive: 0,
          points: 0,
        });
        setCodeError(''); // Clear error when adding new
      }
    }
  }, [isOpen, isEditing, model]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (codeError || isCheckingCode) {
      return; // Prevent submission if there's a code error or still checking
    }
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Model' : 'Add Model'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, code: value });
                      checkCodeUniqueness(value);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${codeError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., A, B, AA, AB"
                    required
                  />
                  {codeError && (
                    <p className="text-red-500 text-sm mt-1">{codeError}</p>
                  )}
                  {isCheckingCode && (
                    <p className="text-gray-500 text-sm mt-1">
                      Checking code uniqueness...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((cat) => cat.status === 'Active')
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Specifications
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gross Weight
                </label>
                <input
                  type="text"
                  value={formData.specifications.grossWeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        grossWeight: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8.400Kg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    kW/HP
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.kwHp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          kwHp: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0.75/1.0 HP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voltage
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.voltage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          voltage: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.specifications.mrpPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        mrpPrice: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-800 mb-3 uppercase tracking-wide">Incentive &amp; Points</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incentive Amount (₹ per unit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.incentive}
                      onChange={(e) => setFormData({ ...formData, incentive: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points (per unit sold)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-1">
                Warranty
              </h3>
              {formData.warranty.map((w, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 mb-2 items-center"
                >
                  <select
                    value={w.state}
                    onChange={(e) =>
                      handleWarrantyChange(index, 'state', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <select
                    value={w.city}
                    onChange={(e) =>
                      handleWarrantyChange(index, 'city', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select District</option>
                    {districts[w.state]?.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <select
                    value={w.durationType}
                    onChange={(e) =>
                      handleWarrantyChange(
                        index,
                        'durationType',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                  <input
                    type="number"
                    value={w.duration}
                    onChange={(e) =>
                      handleWarrantyChange(index, 'duration', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Duration"
                  />
                  <button
                    type="button"
                    onClick={() => removeWarranty(index)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addWarranty}
                className="mb-6 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                + Add Warranty
              </button>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || codeError || isCheckingCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
