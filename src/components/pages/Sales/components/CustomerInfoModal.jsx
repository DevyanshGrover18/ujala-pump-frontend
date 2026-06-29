import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, User, Phone, MapPin, Pencil } from 'lucide-react';

const CustomerInfoModal = ({ isOpen, onClose, sale, onRequestSubmitted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    alternateMobileNumber: '',
    customerAddress: '',
    plumberName: '',
    plumberMobileNumber: '',
  });

  const phoneRegex = /^[0-9]{10}$/;

  useEffect(() => {
    if (sale) {
      setFormData({
        customerName: sale.customerName || '',
        customerPhone: sale.customerPhone || '',
        alternateMobileNumber: sale.alternateMobileNumber || '',
        customerAddress: sale.customerAddress || '',
        plumberName: sale.plumberName || '',
        plumberMobileNumber: sale.plumberMobileNumber || '',
      });
      setErrors({});
      setIsEditing(false);
    }
  }, [sale]);

  if (!isOpen) return null;

  const isFilledPhone = (val) => val && val.trim() !== '' && val.trim() !== 'N/A';

  const validateForm = () => {
    const newErrors = {};

    if (isFilledPhone(formData.customerPhone) && !phoneRegex.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Customer phone must be 10 digits';
    }
    if (isFilledPhone(formData.alternateMobileNumber) && !phoneRegex.test(formData.alternateMobileNumber)) {
      newErrors.alternateMobileNumber = 'Alternate mobile must be 10 digits';
    }
    if (isFilledPhone(formData.plumberMobileNumber) && !phoneRegex.test(formData.plumberMobileNumber)) {
      newErrors.plumberMobileNumber = 'Plumber mobile must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/sales/${sale._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Details updated successfully');
      onRequestSubmitted();
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, name, icon, isPhone = false) => (
    <div className="flex items-start">
      {icon}
      <div className="ml-4 w-full">
        <p className="text-sm text-gray-500">{label}</p>
        {isEditing ? (
          <>
            <input
              type="text"
              value={formData[name]}
              maxLength={isPhone ? 10 : undefined}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [name]: isPhone
                    ? e.target.value.replace(/\D/g, '')
                    : e.target.value,
                })
              }
              className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2"
            />
            {errors[name] && (
              <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
            )}
          </>
        ) : (
          <p className="text-lg font-semibold text-gray-800">
            {formData[name] || 'N/A'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-90 bg-black/70 flex items-center justify-center px-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            Customer Information
          </h3>
          <div className="flex items-center gap-8">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 rounded"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {renderField(
            'Name',
            'customerName',
            <User className="h-6 w-6 text-gray-500" />
          )}
          {renderField(
            'Phone',
            'customerPhone',
            <Phone className="h-6 w-6 text-gray-500" />,
            true
          )}
          {renderField(
            'Alternate Mobile Number',
            'alternateMobileNumber',
            <Phone className="h-6 w-6 text-gray-500" />,
            true
          )}
          {renderField(
            'Address',
            'customerAddress',
            <MapPin className="h-6 w-6 text-gray-500" />
          )}
          {renderField(
            'Plumber Name',
            'plumberName',
            <User className="h-6 w-6 text-gray-500" />
          )}
          {renderField(
            'Plumber Mobile Number',
            'plumberMobileNumber',
            <Phone className="h-6 w-6 text-gray-500" />,
            true
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoModal;
