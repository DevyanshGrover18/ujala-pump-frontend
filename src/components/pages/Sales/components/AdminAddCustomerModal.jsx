import React, { useState } from 'react';
import { X } from 'lucide-react';

const phoneRegex = /^[0-9]{10}$/;

const AdminAddCustomerModal = ({ isOpen, onClose, product, onSubmit }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        plumberName: '',
        alternateMobileNumber: '',
        plumberMobileNumber: '',
        saleDate: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen || !product) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.replace(/\D/g, '') });
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.customerPhone && !phoneRegex.test(formData.customerPhone)) {
            newErrors.customerPhone = 'Enter valid 10-digit number';
        }
        if (formData.alternateMobileNumber && !phoneRegex.test(formData.alternateMobileNumber)) {
            newErrors.alternateMobileNumber = 'Enter valid 10-digit number';
        }
        if (formData.plumberMobileNumber && !phoneRegex.test(formData.plumberMobileNumber)) {
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
            await onSubmit(product._id, {
                customerName: formData.customerName.trim() || 'Anonymous',
                customerPhone: formData.customerPhone.trim() || 'N/A',
                customerAddress: formData.customerAddress.trim() || 'N/A',
                plumberName: formData.plumberName.trim() || 'N/A',
                alternateMobileNumber: formData.alternateMobileNumber.trim() || 'N/A',
                plumberMobileNumber: formData.plumberMobileNumber.trim() || 'N/A',
                saleDate: formData.saleDate,
            });
            onClose();
        } catch (error) {
            console.error('Error adding to sales:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold text-gray-800">
                        Add Sale Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-transform transform hover:scale-110"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                            <input
                                type="text"
                                value={product.serialNumber || ''}
                                disabled
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    maxLength="10"
                                    value={formData.customerPhone}
                                    onChange={handlePhoneChange}
                                    placeholder="9999999999"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.customerPhone && (
                                    <p className="text-red-500 text-[10px]">{errors.customerPhone}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                                <input
                                    type="text"
                                    name="alternateMobileNumber"
                                    maxLength="10"
                                    value={formData.alternateMobileNumber}
                                    onChange={handlePhoneChange}
                                    placeholder="8888888888"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.alternateMobileNumber && (
                                    <p className="text-red-500 text-[10px]">{errors.alternateMobileNumber}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                name="customerAddress"
                                rows={3}
                                value={formData.customerAddress}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plumber Name</label>
                                <input
                                    type="text"
                                    name="plumberName"
                                    value={formData.plumberName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plumber Phone</label>
                                <input
                                    type="text"
                                    name="plumberMobileNumber"
                                    maxLength="10"
                                    value={formData.plumberMobileNumber}
                                    onChange={handlePhoneChange}
                                    placeholder="7777777777"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.plumberMobileNumber && (
                                    <p className="text-red-500 text-[10px]">{errors.plumberMobileNumber}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sale Date</label>
                            <input
                                type="date"
                                name="saleDate"
                                value={formData.saleDate}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddCustomerModal;
