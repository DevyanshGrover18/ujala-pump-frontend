import { useState, useEffect, useMemo } from 'react';
import { Search, X, Box, ShoppingCart, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function ExecutiveDealers() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'sales' or 'inventory'
  const [modalItems, setModalItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dealers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDealers(res.data);
    } catch (error) {
      toast.error('Failed to load dealers.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleOpenSales = async (dealer) => {
    try {
      setSelectedDealer(dealer);
      setModalType('sales');
      setModalLoading(true);
      setModalItems([]);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dealers/${dealer._id}/sales`, {
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

  const handleOpenInventory = async (dealer) => {
    try {
      setSelectedDealer(dealer);
      setModalType('inventory');
      setModalLoading(true);
      setModalItems([]);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dealers/${dealer._id}/inventory`, {
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

  const filteredDealers = useMemo(() => {
    return dealers.filter(d => 
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dealerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.distributor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dealers, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-card p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Assigned Dealers</h1>
          <p className="text-sm text-gray-500 mt-1">View list of assigned dealers, their inventory stock levels, and customer sales.</p>
        </div>
        <TableExportButtons
          exportName="Assigned_Dealers"
          exportData={filteredDealers.map(d => ({
            'ID': d.dealerId,
            'Name': d.name,
            'City': d.city || 'N/A',
            'Parent Distributor': d.distributor?.name || 'N/A',
            'Sales Count': d.salesCount || 0,
            'Inventory Count': d.inventoryCount || 0
          }))}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by ID, name, city or distributor..."
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
      ) : filteredDealers.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 rounded-xl">
          No dealers assigned to you.
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
                  Distributor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-Dealers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDealers.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {d.dealerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {d.distributor?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenSales(d)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-green-500 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      {d.salesCount || 0} Sales
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenInventory(d)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      {d.inventoryCount || 0} Inventory
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {d.subDealerCount || 0} Sub-Dealers
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
                  {modalType === 'sales' ? `Sales History` : `Current Inventory`} - {selectedDealer?.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {modalType === 'sales' ? 'List of all dispatches to sub dealers and direct customer sales.' : 'Available physical items in dealer warehouse.'}
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
                exportName={`${selectedDealer?.name}_${modalType}`}
                exportData={modalItems.map((item, idx) => {
                  if (modalType === 'sales') {
                    return {
                      'Serial Number': item.serialNumber,
                      'Model': item.modelName,
                      'Type': item.type,
                      'Assigned/Sold To': item.soldTo,
                      'Date': new Date(item.date).toLocaleDateString()
                    };
                  } else {
                    return {
                      'Serial Number': item.product?.serialNumber,
                      'Model': item.product?.model?.name || 'N/A',
                      'Status': item.product?.status || 'Active',
                      'Dispatch Date': new Date(item.createdAt).toLocaleDateString()
                    };
                  }
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
              ) : modalType === 'sales' ? (
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Sale Type</th>
                      <th className="px-4 py-3">Dispatched / Sold To</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {modalItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.serialNumber}</td>
                        <td className="px-4 py-3">{item.modelName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.type === 'Sub Dealer Sale' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{item.soldTo}</td>
                        <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {modalItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.product?.serialNumber}</td>
                        <td className="px-4 py-3">{item.product?.model?.name || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded text-xs">
                            Active
                          </span>
                        </td>
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
