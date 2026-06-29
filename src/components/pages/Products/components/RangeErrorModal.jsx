import React from 'react';

const RangeErrorModal = ({
  isOpen,
  onClose,
  rangeErrorMessage,
  availableRange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-md p-6 mx-4">
        <div className="flex items-start justify-between">
          <h4 className="text-lg font-semibold">Range Error</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-700">
          <p>
            {rangeErrorMessage}{' '}
            <span className="font-medium">({availableRange})</span>
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default RangeErrorModal;
