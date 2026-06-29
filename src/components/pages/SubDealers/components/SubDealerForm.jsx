import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function SubDealerForm({
  newItem,
  setNewItem,
  isEditing,
  isSubmitting,
  dealers,
  states,
  cities,
  locations,
  fetchCities,
  fetchLocations,
  onCancel,
  onSubmit,
}) {
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

    setNewItem({
      ...newItem,
      contactPhone: numericOnly,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Sub-Dealer' : 'Add New Sub-Dealer'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Enter name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat/House No./Building Name *
              </label>
              <input
                type="text"
                required
                value={newItem.addressLine1}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    addressLine1: e.target.value,
                  })
                }
                placeholder="Enter Flat/House No./Building Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Name/Landmark
              </label>
              <input
                type="text"
                value={newItem.addressLine2}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    addressLine2: e.target.value,
                  })
                }
                placeholder="Street Name/Landmark (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                required
                value={newItem.state}
                onChange={(e) => {
                  setNewItem({
                    ...newItem,
                    state: e.target.value,
                    district: '',
                    location: '',
                    pincode: '',
                  });
                  fetchCities(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                value={newItem.district}
                onChange={(e) => {
                  setNewItem({
                    ...newItem,
                    district: e.target.value,
                    location: '',
                    pincode: '',
                  });
                  fetchLocations(newItem.state, e.target.value);
                }}
                disabled={!newItem.state}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value="">Select District</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                value={newItem.location}
                onChange={(e) => {
                  const selectedLocation = locations.find(
                    (loc) => loc.location === e.target.value
                  );

                  if (selectedLocation) {
                    setNewItem({
                      ...newItem,
                      location: selectedLocation.location,
                      pincode: selectedLocation.pincode,
                    });
                  } else {
                    setNewItem({
                      ...newItem,
                      location: e.target.value,
                      pincode: '',
                    });
                  }
                }}
                disabled={!newItem.district}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value="">Select Location</option>
                {locations.map((l) => (
                  <option key={l.location} value={l.location}>
                    {l.location}
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
                value={newItem.pincode}
                onChange={(e) =>
                  setNewItem({ ...newItem, pincode: e.target.value })
                }
                placeholder="Enter 6-digit pincode"
                pattern="^\d{6}$"
                maxLength="6"
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={newItem.contactPerson}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    contactPerson: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone No. *
              </label>
              <input
                type="tel"
                required
                value={newItem.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
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
                value={newItem.email}
                onChange={(e) =>
                  setNewItem({ ...newItem, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={newItem.status}
                onChange={(e) =>
                  setNewItem({ ...newItem, status: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer
              </label>
              <select
                value={newItem.dealer}
                onChange={(e) =>
                  setNewItem({ ...newItem, dealer: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              >
                <option value="">Select Dealer</option>
                {dealers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
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
                value={newItem.username}
                onChange={(e) =>
                  setNewItem({ ...newItem, username: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
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
                value={newItem.password}
                onChange={(e) =>
                  setNewItem({ ...newItem, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
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
                  onClick={() => setNewItem({ ...newItem, eligibleForIncentive: !newItem.eligibleForIncentive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newItem.eligibleForIncentive !== false ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    newItem.eligibleForIncentive !== false ? 'translate-x-6' : 'translate-x-1'
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
                  onClick={() => setNewItem({ ...newItem, eligibleForPoints: !newItem.eligibleForPoints })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newItem.eligibleForPoints !== false ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    newItem.eligibleForPoints !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Sub-Dealer'
                : 'Add Sub-Dealer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}