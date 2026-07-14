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
    plumberIncentive: 0,
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
          plumberIncentive: model.plumberIncentive ?? 0,
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
          plumberIncentive: 0,
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
      <div className="bg-white rounded-lg flex flex-col w-full max-w-6xl max-h-[90vh]">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
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
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-6">
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
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                  Incentives &amp; Points
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Incentive Amount (₹ per unit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.incentive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incentive: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Points (per unit sold)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Plumber Incentive (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.plumberIncentive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plumberIncentive: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. 150"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
             <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-gray-900">
                  Warranty Rules
                </h3>
                <button
                  type="button"
                  onClick={addWarranty}
                  className="px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
                >
                  + Add Warranty
                </button>
              </div>

              {formData.warranty.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs mb-6">
                  No state/city-specific warranty periods set. Click "+ Add Warranty" to create one.
                </div>
              ) : (
                <div className="space-y-4 mb-6 flex-1 min-h-0 overflow-y-auto pr-1">
                  {formData.warranty.map((w, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative space-y-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          Rule #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWarranty(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Warranty Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            State
                          </label>
                          <select
                            value={w.state}
                            onChange={(e) =>
                              handleWarrantyChange(index, 'state', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            District / City
                          </label>
                          <select
                            value={w.city}
                            onChange={(e) =>
                              handleWarrantyChange(index, 'city', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="">Select District</option>
                            {districts[w.state]?.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Duration Type
                          </label>
                          <select
                            value={w.durationType}
                            onChange={(e) =>
                              handleWarrantyChange(
                                index,
                                'durationType',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="Months">Months</option>
                            <option value="Years">Years</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Duration
                          </label>
                          <input
                            type="number"
                            value={w.duration}
                            onChange={(e) =>
                              handleWarrantyChange(index, 'duration', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            placeholder="e.g. 2"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || codeError || isCheckingCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold transition-colors"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
