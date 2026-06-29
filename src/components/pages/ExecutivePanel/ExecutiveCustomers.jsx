import { useState, useEffect, useMemo } from 'react';
import { Search, X, User, Phone, MapPin, Calendar, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function ExecutiveCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/executives/me/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to load customer list.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone?.includes(searchTerm) ||
      c.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-card p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Directory</h1>
          <p className="text-sm text-gray-500 mt-1">View customers registered under your assigned distributors, dealers and sub dealers.</p>
        </div>
        <TableExportButtons
          exportName="Customer_Directory"
          exportData={filteredCustomers.map(c => ({
            'Customer Name': c.customerName,
            'Phone Number': c.customerPhone,
            'Address': c.customerAddress || 'N/A',
            'Product Model': c.product?.model?.name || 'N/A',
            'Serial Number': c.product?.serialNumber || 'N/A',
            'Registration Date': new Date(c.saleDate || c.createdAt).toLocaleDateString(),
            'Sold By': c.subDealer?.name || c.dealer?.name || c.distributor?.name || 'N/A'
          }))}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by customer name, phone, serial number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d55f5]"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5]"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 rounded-xl">
          No customer records found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Serial Number</th>
                <th className="px-6 py-4">Product Model</th>
                <th className="px-6 py-4">Sold By</th>
                <th className="px-6 py-4">Sale Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {c.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {c.customerPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{c.product?.serialNumber}</td>
                  <td className="px-6 py-4">{c.product?.model?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-2.5 py-1 rounded text-xs font-semibold text-gray-700">
                      {c.subDealer?.name || c.dealer?.name || c.distributor?.name || 'Direct'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(c.saleDate || c.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4d55f5]/10 hover:bg-[#4d55f5]/20 text-[#4d55f5] text-xs font-bold rounded-xl transition-all"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Info Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#4d55f5]" />
                  Customer Registration Info
                </h3>
                <p className="text-xs text-gray-400 mt-1">Full details of the customer registration and plumber assignment.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              {/* Customer details */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer Details</p>
                <p><strong className="text-gray-800">Name:</strong> {selectedCustomer.customerName}</p>
                <p><strong className="text-gray-800">Phone:</strong> {selectedCustomer.customerPhone}</p>
                {selectedCustomer.alternateMobileNumber && (
                  <p><strong className="text-gray-800">Alt Phone:</strong> {selectedCustomer.alternateMobileNumber}</p>
                )}
                <p className="flex items-start gap-1">
                  <strong className="text-gray-800 flex-shrink-0">Address:</strong>
                  <span>{selectedCustomer.customerAddress || 'N/A'}</span>
                </p>
              </div>

              {/* Product details */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Product Information</p>
                <p><strong className="text-gray-800">Model Name:</strong> {selectedCustomer.product?.model?.name || 'N/A'}</p>
                <p><strong className="text-gray-800">Serial Number:</strong> {selectedCustomer.product?.serialNumber || 'N/A'}</p>
                <p><strong className="text-gray-800">Purchase Date:</strong> {new Date(selectedCustomer.saleDate || selectedCustomer.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Plumber details */}
              {(selectedCustomer.plumberName || selectedCustomer.plumberMobileNumber) && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Plumber Details</p>
                  {selectedCustomer.plumberName && <p><strong className="text-gray-800">Name:</strong> {selectedCustomer.plumberName}</p>}
                  {selectedCustomer.plumberMobileNumber && <p><strong className="text-gray-800">Phone:</strong> {selectedCustomer.plumberMobileNumber}</p>}
                </div>
              )}

              {/* Hierarchy details */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-xs">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Hierarchy Audit Trail</p>
                <p><strong className="text-gray-800">Distributor:</strong> {selectedCustomer.distributor?.name || 'N/A'}</p>
                {selectedCustomer.dealer && <p><strong className="text-gray-800">Dealer:</strong> {selectedCustomer.dealer.name}</p>}
                {selectedCustomer.subDealer && <p><strong className="text-gray-800">Sub Dealer:</strong> {selectedCustomer.subDealer.name}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
