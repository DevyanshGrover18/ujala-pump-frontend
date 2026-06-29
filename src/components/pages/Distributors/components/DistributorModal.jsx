import React, { useState } from 'react';
import { X } from 'lucide-react';

const DistributorModal = ({
  isOpen,
  isEditing,
  distributor,
  states,
  cities,
  locations,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
  onStateChange,
  onDistrictChange,
  onLocationChange,
}) => {
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (value) => {
    const numericOnly = value.replace(/[^0-9]/g, '');
    
    if (value !== numericOnly && value.length > 0) {
      setPhoneError('Phone number must contain only numbers');
    } else if (numericOnly.length > 0 && numericOnly.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else if (numericOnly.length === 10) {
      setPhoneError('');
    } else {
      setPhoneError('');
    }

    onChange({ ...distributor, contactPhone: numericOnly });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-4 w-full max-w-md lg:max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Distributor' : 'Add New Distributor'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={distributor.name}
                onChange={(e) =>
                  onChange({ ...distributor, name: e.target.value })
                }
                placeholder="Enter distributor name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                required
                value={distributor.state}
                onChange={(e) => onStateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <select
                required
                value={distributor.district}
                onChange={(e) =>
                  onDistrictChange(distributor.state, e.target.value)
                }
                disabled={!distributor.state}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="">Select District</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                required
                value={distributor.location}
                onChange={(e) => onLocationChange(e.target.value)}
                disabled={!distributor.district}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.location} value={loc.location}>
                    {loc.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat/House No./Building Name*
              </label>
              <input
                type="text"
                required
                value={distributor.addressLine1}
                onChange={(e) =>
                  onChange({ ...distributor, addressLine1: e.target.value })
                }
                placeholder="Flat/House No./Building Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Name/Landmark
              </label>
              <input
                type="text"
                value={distributor.addressLine2}
                onChange={(e) =>
                  onChange({ ...distributor, addressLine2: e.target.value })
                }
                placeholder="Enter Street Name/Landmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={distributor.pincode}
                onChange={(e) =>
                  onChange({ ...distributor, pincode: e.target.value })
                }
                placeholder="Enter 6-digit pincode"
                pattern="^\d{6}$"
                maxLength="6"
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number *
              </label>
              <input
                type="text"
                required
                value={distributor.gstNumber}
                onChange={(e) =>
                  onChange({ ...distributor, gstNumber: e.target.value })
                }
                placeholder="Enter GST Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={distributor.contactPerson}
                onChange={(e) =>
                  onChange({ ...distributor, contactPerson: e.target.value })
                }
                placeholder="Enter contact person name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone No. *
              </label>
              <input
                type="tel"
                required
                value={distributor.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter Phone No."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                  phoneError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#4d55f5]'
                }`}
                maxLength={10}
                inputMode="numeric"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="font-semibold">✕</span>
                  {phoneError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={distributor.email}
                onChange={(e) =>
                  onChange({ ...distributor, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                required
                value={distributor.username}
                onChange={(e) =>
                  onChange({ ...distributor, username: e.target.value })
                }
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={distributor.password}
                onChange={(e) =>
                  onChange({ ...distributor, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={distributor.status}
                onChange={(e) =>
                  onChange({ ...distributor, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isEditing ? (
                'Update Distributor'
              ) : (
                'Add Distributor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistributorModal;