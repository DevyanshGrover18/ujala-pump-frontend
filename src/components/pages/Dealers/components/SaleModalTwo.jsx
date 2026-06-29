import React, { useState } from 'react';

const SaleModal = ({ isOpen, onClose, products, onSale }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [plumberName, setPlumberName] = useState('');
  const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
  const [plumberMobileNumber, setPlumberMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const phoneRegex = /^[0-9]{10}$/;

  const validateForm = () => {
    let newErrors = {};

    if (customerPhone && !phoneRegex.test(customerPhone)) {
      newErrors.customerPhone = 'Enter valid 10-digit number';
    }

    if (alternateMobileNumber && !phoneRegex.test(alternateMobileNumber)) {
      newErrors.alternateMobileNumber = 'Enter valid 10-digit number';
    }

    if (plumberMobileNumber && !phoneRegex.test(plumberMobileNumber)) {
      newErrors.plumberMobileNumber = 'Enter valid 10-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSale({
        customerName: customerName.trim() || 'Anonymous',
        customerPhone: customerPhone.trim() || 'N/A',
        customerAddress: customerAddress.trim() || 'N/A',
        plumberName: plumberName.trim() || 'N/A',
        alternateMobileNumber: alternateMobileNumber.trim() || 'N/A',
        plumberMobileNumber: plumberMobileNumber.trim() || 'N/A',
      });
      onClose();
    } catch (error) {
      console.error('Error adding to sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-90 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full pt-4 px-4 text-center sm:block sm:p-0 bg-black/70">
        <div className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sell Products
              </h3>

              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Selected Products:</p>
                <div className="bg-gray-100 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {products?.map((product) => (
                    <div key={product._id} className="mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        {product.model?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.serialNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-[10px]">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Customer Phone - Added 10 digit limit */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="9999999999"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-[10px]">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Address
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                </div>

                {/* Alternate Mobile - Added 10 digit limit */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Alternate Mobile
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
                    placeholder="8888888888"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                  {errors.alternateMobileNumber && (
                    <p className="text-red-500 text-[10px]">
                      {errors.alternateMobileNumber}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Plumber Name
                  </label>
                  <input
                    type="text"
                    value={plumberName}
                    onChange={(e) => setPlumberName(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                </div>

                {/* Plumber Mobile - Added 10 digit limit */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Plumber Mobile
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    value={plumberMobileNumber}
                    onChange={(e) =>
                      setPlumberMobileNumber(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="7777777777"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
                  />
                  {errors.plumberMobileNumber && (
                    <p className="text-red-500 text-[10px]">
                      {errors.plumberMobileNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons UI unchanged */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
                sm:ml-3 sm:w-auto sm:text-sm`}
              >
                {loading ? 'Processing...' : 'Add to Sales'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
