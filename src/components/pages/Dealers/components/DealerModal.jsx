import React, { useState } from 'react';
import { X } from 'lucide-react';

const DealerModal = ({
  isOpen,
  isEditing,
  dealer,
  newDealer,
  onDealerChange,
  onSubmit,
  onClose,
  states,
  cities,
  locations,
  distributors,
  isSubmitting,
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

    onDealerChange({
      ...newDealer,
      contactPhone: numericOnly,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-4 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Dealer' : 'Add New Dealer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={newDealer.name}
                onChange={(e) =>
                  onDealerChange({ ...newDealer, name: e.target.value })
                }
                placeholder="Enter dealer name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat/House No./Building Name *
              </label>
              <input
                type="text"
                required
                value={newDealer.addressLine1}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    addressLine1: e.target.value,
                  })
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
                value={newDealer.addressLine2}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    addressLine2: e.target.value,
                  })
                }
                placeholder="Street Name/Landmark (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                required
                value={newDealer.state}
                onChange={(e) => {
                  onDealerChange({
                    ...newDealer,
                    state: e.target.value,
                    district: '',
                    location: '',
                    pincode: '',
                  });
                }}
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
                value={newDealer.district}
                onChange={(e) => {
                  onDealerChange({
                    ...newDealer,
                    district: e.target.value,
                    location: '',
                    pincode: '',
                  });
                }}
                disabled={!newDealer.state}
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
                value={newDealer.location}
                onChange={(e) => {
                  const selectedLocation = locations.find(
                    (loc) => loc.location === e.target.value
                  );

                  if (selectedLocation) {
                    onDealerChange({
                      ...newDealer,
                      location: selectedLocation.location,
                      pincode: selectedLocation.pincode,
                    });
                  } else {
                    onDealerChange({
                      ...newDealer,
                      location: e.target.value,
                      pincode: '',
                    });
                  }
                }}
                disabled={!newDealer.district}
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
                Pincode *
              </label>
              <input
                type="text"
                required
                value={newDealer.pincode}
                onChange={(e) =>
                  onDealerChange({ ...newDealer, pincode: e.target.value })
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
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={newDealer.contactPerson}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    contactPerson: e.target.value,
                  })
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
                value={newDealer.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter Phone No."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
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
                value={newDealer.email}
                onChange={(e) =>
                  onDealerChange({ ...newDealer, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={newDealer.status}
                onChange={(e) =>
                  onDealerChange({ ...newDealer, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distributor
              </label>
              <select
                value={newDealer.distributor}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    distributor: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="">Select Distributor</option>
                {distributors.map((distributor) => (
                  <option key={distributor._id} value={distributor._id}>
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username {!isEditing && '*'}
              </label>
              <input
                type="text"
                required={!isEditing}
                value={newDealer.username}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    username: e.target.value,
                  })
                }
                placeholder={
                  isEditing
                    ? 'Leave blank to keep current username'
                    : 'Enter username'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {!isEditing && '*'}
              </label>
              <input
                type="password"
                required={!isEditing}
                minLength={8}
                value={newDealer.password}
                onChange={(e) =>
                  onDealerChange({
                    ...newDealer,
                    password: e.target.value,
                  })
                }
                placeholder={
                  isEditing
                    ? 'Leave blank to keep current password'
                    : 'Enter password'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>
          </div>

          {/* Incentive & Points Eligibility */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-sm font-semibold text-amber-800 mb-4 uppercase tracking-wide">Incentive &amp; Points Eligibility</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Eligible for Incentive</p>
                  <p className="text-xs text-gray-500">Can earn incentive on sales</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDealerChange({ ...newDealer, eligibleForIncentive: !newDealer.eligibleForIncentive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newDealer.eligibleForIncentive !== false ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    newDealer.eligibleForIncentive !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Eligible for Points</p>
                  <p className="text-xs text-gray-500">Can earn points on sales</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDealerChange({ ...newDealer, eligibleForPoints: !newDealer.eligibleForPoints })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newDealer.eligibleForPoints !== false ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    newDealer.eligibleForPoints !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
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
                'Update Dealer'
              ) : (
                'Add Dealer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerModal;