import React, { useState } from 'react';
import { X } from 'lucide-react';

const AccountsMemberModal = ({
  isOpen,
  isEditing,
  member,
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
    } else {
      setPhoneError('');
    }
    onChange({ ...member, contactPhone: numericOnly });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md lg:max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Accounts Member' : 'Add New Accounts Member'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={member.name}
                onChange={(e) => onChange({ ...member, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <select
                required
                value={member.state}
                onChange={(e) => onStateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
              <select
                required
                value={member.district}
                onChange={(e) => onDistrictChange(member.state, e.target.value)}
                disabled={!member.state}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent disabled:opacity-50"
              >
                <option value="">Select District</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                required
                value={member.location}
                onChange={(e) => onLocationChange(e.target.value)}
                disabled={!member.district}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent disabled:opacity-50"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.location} value={loc.location}>{loc.location}</option>
                ))}
              </select>
            </div>

            {/* Address Line 1 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
              <input
                type="text"
                required
                value={member.addressLine1}
                onChange={(e) => onChange({ ...member, addressLine1: e.target.value })}
                placeholder="Street / building address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={member.addressLine2}
                onChange={(e) => onChange({ ...member, addressLine2: e.target.value })}
                placeholder="Landmark, area (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={member.pincode}
                onChange={(e) => onChange({ ...member, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="6-digit pincode"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
              <input
                type="text"
                required
                value={member.gstNumber}
                onChange={(e) => onChange({ ...member, gstNumber: e.target.value.toUpperCase() })}
                placeholder="GST registration number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
              <input
                type="text"
                value={member.contactPerson}
                onChange={(e) => onChange({ ...member, contactPerson: e.target.value })}
                placeholder="Primary contact name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={member.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="10-digit phone number"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
              {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={member.email}
                onChange={(e) => onChange({ ...member, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                required
                value={member.username}
                onChange={(e) => onChange({ ...member, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                placeholder="Login username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {isEditing ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                required={!isEditing}
                value={member.password}
                onChange={(e) => onChange({ ...member, password: e.target.value })}
                placeholder={isEditing ? 'Leave blank to keep current password' : 'Min. 8 characters'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={member.status}
                onChange={(e) => onChange({ ...member, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#5b189b] text-white rounded-xl hover:bg-[#4a1280] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isEditing ? 'Updating...' : 'Adding...'
                : isEditing ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountsMemberModal;
