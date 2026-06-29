import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditSaleRequestModal = ({
  isOpen,
  onClose,
  sale,
  onRequestSubmitted,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
  const [plumberName, setPlumberName] = useState('');
  const [plumberMobileNumber, setPlumberMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const phoneRegex = /^[0-9]{10}$/;

  useEffect(() => {
    if (sale) {
      setCustomerName(sale.customerName || '');
      setCustomerPhone(sale.customerPhone || '');
      setCustomerAddress(sale.customerAddress || '');
      setAlternateMobileNumber(sale.alternateMobileNumber || '');
      setPlumberName(sale.plumberName || '');
      setPlumberMobileNumber(sale.plumberMobileNumber || '');
      setErrors({});
    }
  }, [sale]);

  const isFilledPhone = (val) => val && val.trim() !== '' && val.trim() !== 'N/A';

  const validateForm = () => {
    let newErrors = {};

    if (isFilledPhone(customerPhone) && !phoneRegex.test(customerPhone)) {
      newErrors.customerPhone = 'Customer phone must be exactly 10 digits';
    }

    if (isFilledPhone(alternateMobileNumber) && !phoneRegex.test(alternateMobileNumber)) {
      newErrors.alternateMobileNumber = 'Alternate mobile must be exactly 10 digits';
    }

    if (isFilledPhone(plumberMobileNumber) && !phoneRegex.test(plumberMobileNumber)) {
      newErrors.plumberMobileNumber = 'Plumber mobile must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedData = {
        customerName,
        customerPhone,
        customerAddress,
        alternateMobileNumber,
        plumberName,
        plumberMobileNumber,
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/sales/${sale._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Sale updated successfully');
      onRequestSubmitted();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center px-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white w-full max-w-4xl rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Sale Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, ''))
                    }
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                {/* Customer Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Address
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                </div>

                {/* Alternate Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alternate Mobile *
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={alternateMobileNumber}
                    onChange={(e) =>
                      setAlternateMobileNumber(
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                  {errors.alternateMobileNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.alternateMobileNumber}
                    </p>
                  )}
                </div>

                {/* Plumber Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plumber Name
                  </label>
                  <input
                    type="text"
                    value={plumberName}
                    onChange={(e) => setPlumberName(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                </div>

                {/* Plumber Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plumber Mobile *
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={plumberMobileNumber}
                    onChange={(e) =>
                      setPlumberMobileNumber(e.target.value.replace(/\D/g, ''))
                    }
                    className="mt-1 w-full border border-gray-200 rounded-md px-2 py-2"
                  />
                  {errors.plumberMobileNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.plumberMobileNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md text-gray-700 hover:bg-red-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSaleRequestModal;
