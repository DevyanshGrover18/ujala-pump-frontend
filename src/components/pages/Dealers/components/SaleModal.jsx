import React, { useState, useEffect } from 'react';

const SaleModal = ({ isOpen, onClose, group, onSale }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [plumberName, setPlumberName] = useState('');
  const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
  const [plumberMobileNumber, setPlumberMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});

  const phoneRegex = /^[0-9]{10}$/;

  useEffect(() => {
    if (group && group.productsInBox) {
      setProducts(group.productsInBox);
    }
  }, [group]);

  const validateForm = () => {
    let newErrors = {};

    // Phone validations (only if provided)
    if (customerPhone && !phoneRegex.test(customerPhone)) {
      newErrors.customerPhone = 'Customer phone must be exactly 10 digits';
    }

    if (alternateMobileNumber && !phoneRegex.test(alternateMobileNumber)) {
      newErrors.alternateMobileNumber =
        'Alternate mobile must be exactly 10 digits';
    }

    if (plumberMobileNumber && !phoneRegex.test(plumberMobileNumber)) {
      newErrors.plumberMobileNumber =
        'Plumber mobile must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const productIds = products
        .map((p) => p?.productId || p?._id)
        .filter(Boolean);

      await onSale({
        customerName: customerName.trim() || 'Anonymous',
        customerPhone: customerPhone.trim() || 'N/A',
        customerAddress: customerAddress.trim() || 'N/A',
        plumberName: plumberName.trim() || 'N/A',
        alternateMobileNumber: alternateMobileNumber.trim() || 'N/A',
        plumberMobileNumber: plumberMobileNumber.trim() || 'N/A',
        productId: productIds,
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sell Products</h3>

            {/* Products */}
            <div className="mb-4 bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
              {products.map((p, i) => (
                <div key={i} className="text-sm border-b last:border-0 pb-1">
                  {p?.model?.name} - {p?.serialNumber}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="text-sm">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs">{errors.customerName}</p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="text-sm">Customer Phone</label>
                <input
                  type="text"
                  maxLength="10"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs">{errors.customerPhone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="text-sm">Customer Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="text-sm">Alternate Mobile</label>
                <input
                  type="text"
                  maxLength="10"
                  value={alternateMobileNumber}
                  onChange={(e) =>
                    setAlternateMobileNumber(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
                {errors.alternateMobileNumber && (
                  <p className="text-red-500 text-xs">
                    {errors.alternateMobileNumber}
                  </p>
                )}
              </div>

              {/* Plumber Name */}
              <div>
                <label className="text-sm">Plumber Name</label>
                <input
                  type="text"
                  value={plumberName}
                  onChange={(e) => setPlumberName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
              </div>

              {/* Plumber Phone */}
              <div>
                <label className="text-sm">Plumber Mobile</label>
                <input
                  type="text"
                  maxLength="10"
                  value={plumberMobileNumber}
                  onChange={(e) =>
                    setPlumberMobileNumber(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full border border-gray-200 rounded px-2 py-2"
                />
                {errors.plumberMobileNumber && (
                  <p className="text-red-500 text-xs">
                    {errors.plumberMobileNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-50 p-4 flex justify-end gap-2 rounded-lg">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add to Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleModal;

// import React, { useState, useEffect } from 'react';

// const SaleModal = ({ isOpen, onClose, group, onSale }) => {
//   const [customerName, setCustomerName] = useState('');
//   const [customerPhone, setCustomerPhone] = useState('');
//   const [customerAddress, setCustomerAddress] = useState('');
//   const [plumberName, setPlumberName] = useState('');
//   const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
//   const [plumberMobileNumber, setPlumberMobileNumber] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState([]); // Default empty array

//   useEffect(() => {
//     // Jab group load ho jaye, products ko array mein set karein
//     if (group && group.productsInBox) {
//       setProducts(group.productsInBox);
//     }
//   }, [group]);
// console.log(products);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // 🔹 FIX YAHAN HAI: Aapke data mein ID 'productId' field mein hai
//       const productIds = products
//         .map(p => p?.productId || p?._id) // productId check karega pehle
//         .filter(id => id != null);

//       console.log("Sending IDs to backend:", productIds); // Check karne ke liye

//       await onSale({
//         customerName,
//         customerPhone,
//         customerAddress,
//         plumberName,
//         alternateMobileNumber,
//         plumberMobileNumber,
//         productId: productIds
//       });

//       onClose();
//     } catch (error) {
//       console.error("Error adding to sales:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   if (!isOpen) return null;

//   return (
//     <div className="fixed z-90 inset-0 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-full pt-4 px-4 text-center sm:block sm:p-0 bg-black/70">
//         <div className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//           <form onSubmit={handleSubmit}>
//             <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">Sell Products</h3>

//               <div className="mt-2">
//                 <p className="text-sm text-gray-500 mb-2">Selected Products:</p>
//                 <div className='bg-gray-100 rounded-lg p-3 max-h-40 overflow-y-auto'>
//                   {products?.map((product, index) => (
//                     <div key={product?._id || index} className="mb-2 border-b last:border-0 pb-1">
//                       <p className="text-sm font-medium text-gray-700">{product?.model?.name}</p>
//                       <p className="text-xs text-gray-500">{product?.serialNumber}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* 6 Fields Grid as per your request */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="mt-4">
//                   <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
//                   <input
//                     type="text"
//                     id="customerName"
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
//                   <input
//                     type="text"
//                     id="customerPhone"
//                     value={customerPhone}
//                     onChange={(e) => setCustomerPhone(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Customer Address</label>
//                   <input
//                     type="text"
//                     id="customerAddress"
//                     value={customerAddress}
//                     onChange={(e) => setCustomerAddress(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="alternateMobileNumber" className="block text-sm font-medium text-gray-700">Alternate Mobile Number</label>
//                   <input
//                     type="text"
//                     id="alternateMobileNumber"
//                     value={alternateMobileNumber}
//                     onChange={(e) => setAlternateMobileNumber(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="plumberName" className="block text-sm font-medium text-gray-700">Plumber Name</label>
//                   <input
//                     type="text"
//                     id="plumberName"
//                     value={plumberName}
//                     onChange={(e) => setPlumberName(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="plumberMobileNumber" className="block text-sm font-medium text-gray-700">Plumber Mobile Number</label>
//                   <input
//                     type="text"
//                     id="plumberMobileNumber"
//                     value={plumberMobileNumber}
//                     onChange={(e) => setPlumberMobileNumber(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2 border"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Footer Buttons */}
//             <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white
//                 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
//                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
//               >
//                 {loading ? "Processing..." : "Add to Sales"}
//               </button>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SaleModal;

// import React, { useState } from 'react';

// const SaleModal = ({ isOpen, onClose, products, onSale }) => {
//   const [customerName, setCustomerName] = useState('');
//   const [customerPhone, setCustomerPhone] = useState('');
//   const [customerAddress, setCustomerAddress] = useState('');
//   const [plumberName, setPlumberName] = useState('');
//   const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
//   const [plumberMobileNumber, setPlumberMobileNumber] = useState('');
//   const [loading, setLoading] = useState(false); // 🔹 Loader state

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true); // start loader
//     try {
//       await onSale({
//         customerName,
//         customerPhone,
//         customerAddress,
//         plumberName,
//         alternateMobileNumber,
//         plumberMobileNumber,
//       });
//       onClose(); // close modal after successful sale
//     } catch (error) {
//       console.error("Error adding to sales:", error);
//     } finally {
//       setLoading(false); // stop loader
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed z-90 inset-0 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-full pt-4 px-4 text-center sm:block sm:p-0 bg-black/70">
//         <div className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//           <form onSubmit={handleSubmit}>
//             <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">Sell Products</h3>
//               <div className="mt-2">
//                 <p className="text-sm text-gray-500 mb-2">Selected Products:</p>
//                 <div className='bg-gray-100 rounded-lg p-3 max-h-40 overflow-y-auto'>
//                   {products?.map(product => (
//                     <div key={product._id} className="mb-2">
//                       <p className="text-sm font-medium text-gray-700">{product.model?.name}</p>
//                       <ul>
//                         <li className="text-xs text-gray-500">{product.serialNumber}</li>
//                       </ul>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="mt-4">
//                   <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
//                   <input
//                     type="text"
//                     id="customerName"
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
//                   <input
//                     type="text"
//                     id="customerPhone"
//                     value={customerPhone}
//                     onChange={(e) => setCustomerPhone(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Customer Address</label>
//                   <input
//                     type="text"
//                     id="customerAddress"
//                     value={customerAddress}
//                     onChange={(e) => setCustomerAddress(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="alternateMobileNumber" className="block text-sm font-medium text-gray-700">Alternate Mobile Number</label>
//                   <input
//                     type="text"
//                     id="alternateMobileNumber"
//                     value={alternateMobileNumber}
//                     onChange={(e) => setAlternateMobileNumber(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="plumberName" className="block text-sm font-medium text-gray-700">Plumber Name</label>
//                   <input
//                     type="text"
//                     id="plumberName"
//                     value={plumberName}
//                     onChange={(e) => setPlumberName(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label htmlFor="plumberMobileNumber" className="block text-sm font-medium text-gray-700">Plumber Mobile Number</label>
//                   <input
//                     type="text"
//                     id="plumberMobileNumber"
//                     value={plumberMobileNumber}
//                     onChange={(e) => setPlumberMobileNumber(e.target.value)}
//                     className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-2"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Footer Buttons */}
//             <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white
//                 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
//                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
//               >
//                 {loading ? (
//                   <div className="flex items-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l3 3-3 3v-4a8 8 0 01-8-8z"
//                       ></path>
//                     </svg>
//                     Processing...
//                   </div>
//                 ) : (
//                   "Add to Sales"
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700
//                 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SaleModal;
