import { useState, useEffect, useMemo } from 'react';
import { Search, X, Box, ShoppingCart, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function ExecutiveSubDealers() {
  const [subDealers, setSubDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'sales' or 'inventory'
  const [modalItems, setModalItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSubDealer, setSelectedSubDealer] = useState(null);

  const fetchSubDealers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/sub-dealers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubDealers(res.data);
    } catch (error) {
      toast.error('Failed to load sub dealers.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubDealers();
  }, []);

  const handleOpenSales = async (sd) => {
    try {
      setSelectedSubDealer(sd);
      setModalType('sales');
      setModalLoading(true);
      setModalItems([]);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/sub-dealers/${sd._id}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalItems(res.data);
    } catch (error) {
      toast.error('Error fetching sales data');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenInventory = async (sd) => {
    try {
      setSelectedSubDealer(sd);
      setModalType('inventory');
      setModalLoading(true);
      setModalItems([]);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/sub-dealers/${sd._id}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalItems(res.data);
    } catch (error) {
      toast.error('Error fetching inventory data');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSubDealers = useMemo(() => {
    return subDealers.filter(sd => 
      sd.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sd.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sd.subDealerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sd.dealer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subDealers, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-card p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Assigned Sub Dealers</h1>
          <p className="text-sm text-gray-500 mt-1">View list of assigned sub dealers, their current stock levels, and customer sales history.</p>
        </div>
        <TableExportButtons
          exportName="Assigned_Sub_Dealers"
          exportData={filteredSubDealers.map(sd => ({
            'ID': sd.subDealerId,
            'Name': sd.name,
            'District': sd.district || 'N/A',
            'Parent Dealer': sd.dealer?.name || 'N/A',
            'Sales Count': sd.salesCount || 0,
            'Inventory Count': sd.inventoryCount || 0
          }))}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by ID, name, district or dealer..."
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
      ) : filteredSubDealers.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 rounded-xl">
          No sub dealers assigned to you.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredSubDealers.map((sd) => (
                <tr key={sd._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sd.subDealerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sd.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sd.district || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sd.dealer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenSales(sd)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      {sd.salesCount || 0} Sales
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenInventory(sd)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      {sd.inventoryCount || 0} Inventory
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-gray-300" />
                      View Only
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sales / Inventory Detail Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {modalType === 'sales' ? `Sales History` : `Current Inventory`} - {selectedSubDealer?.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {modalType === 'sales' ? 'List of all registered customer sales.' : 'Available physical items in sub dealer warehouse.'}
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-end mb-4">
              <TableExportButtons
                exportName={`${selectedSubDealer?.name}_${modalType}`}
                exportData={modalItems.map((item, idx) => {
                  return {
                    'Serial Number': item.product?.serialNumber,
                    'Model': item.product?.model?.name || 'N/A',
                    'Customer Name': item.customerName || 'N/A',
                    'Customer Phone': item.customerPhone || 'N/A',
                    'Date': new Date(item.createdAt).toLocaleDateString()
                  };
                })}
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded-xl">
              {modalLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4d55f5]"></div>
                </div>
              ) : modalItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-sm">
                  No records found.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Customer Name</th>
                      <th className="px-4 py-3">Customer Phone</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {modalItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.product?.serialNumber}</td>
                        <td className="px-4 py-3">{item.product?.model?.name || 'N/A'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{item.customerName || 'N/A'}</td>
                        <td className="px-4 py-3">{item.customerPhone || 'N/A'}</td>
                        <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
