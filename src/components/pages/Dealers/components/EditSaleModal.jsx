import React, { useState, useEffect } from 'react';

const EditSaleModal = ({ isOpen, onClose, sale, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [plumberName, setPlumberName] = useState('');

  useEffect(() => {
    if (sale) {
      setCustomerName(sale.customerName || '');
      setCustomerPhone(sale.customerPhone || '');
      setCustomerAddress(sale.customerAddress || '');
      setPlumberName(sale.plumberName || '');
    }
  }, [sale]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ customerName, customerPhone, customerAddress, plumberName });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-full pt-4 px-4 pb-20 text-center sm:block sm:p-0 bg-black/70">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-full"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Edit Sale
              </h3>
              <div className="mt-4">
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="customerPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Phone
                </label>
                <input
                  type="text"
                  name="customerPhone"
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="customerAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Address
                </label>
                <input
                  type="text"
                  name="customerAddress"
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="plumberName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Plumber Name
                </label>
                <input
                  type="text"
                  name="plumberName"
                  id="plumberName"
                  value={plumberName}
                  onChange={(e) => setPlumberName(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default EditSaleModal;
