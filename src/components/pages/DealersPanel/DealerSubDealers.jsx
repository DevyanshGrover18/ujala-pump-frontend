import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SubDealerForm from '../SubDealers/components/SubDealerForm';
import SubDealerTable from '../SubDealers/components/SubDealerTable';
import SubDealerProductsModal from './SubDealerProductsModal';
import { AuthContext } from '../../../context/AuthContext';
import TableExportButtons from '../../global/TableExportButtons';

export default function DealerSubDealers() {
  const { user } = useContext(AuthContext);
  const dealerId = user?.dealer?._id || user?.dealer;

  const [searchTerm, setSearchTerm] = useState('');
  const [subDealers, setSubDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [states, setStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedSubDealer, setSelectedSubDealer] = useState(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [locations, setLocations] = useState([]);

  const [newItem, setNewItem] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    district: '',
    location: '',
    pincode: '',
    phone: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    status: 'Active',
    dealer: dealerId || '',
    username: '',
    password: '',
  });

  const [cities, setCities] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  const fetchSubDealers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/dealer/my-sub-dealers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSubDealers(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error fetching sub-dealers'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubDealers();

    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/locations/states`
        );
        setStates(response.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  const fetchCities = async (state) => {
    if (!state) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/locations/districts/${state}`
      );
      setCities(response.data);
      setLocations([]);
    } catch (error) {
      console.error(`Error fetching cities for ${state}:`, error);
    }
  };

  const fetchLocations = async (state, district) => {
    if (!state || !district) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/locations/locations/${state}/${district}`
      );
      setLocations(response.data);
    } catch (error) {
      console.error(
        `Error fetching locations for ${state} - ${district}:`,
        error
      );
    }
  };

  useEffect(() => {
    if (newItem.state) {
      fetchCities(newItem.state);
    }
    if (newItem.state && newItem.district) {
      fetchLocations(newItem.state, newItem.district);
    }
  }, [newItem.state, newItem.district]);

  const handleAddEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let dataToSend = { ...newItem };

      // When editing, only send password if it's not empty
      if (isEditing && !newItem.password.trim()) {
        delete dataToSend.password;
      }

      if (isEditing) {
        await axios.put(
          `${API_URL}/dealer/sub-dealers/${selected._id}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Sub-dealer updated successfully');
      } else {
        await axios.post(`${API_URL}/dealer/sub-dealers`, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Sub-dealer added successfully');
      }
      fetchSubDealers();
      handleModalClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving sub-dealer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item) => {
    setSelected(item);
    setNewItem({
      name: item.name,
      addressLine1: item.addressLine1,
      addressLine2: item.addressLine2,
      state: item.state,
      district: item.district,
      location: item.location,
      pincode: item.pincode,
      phone: item.phone,
      contactPerson: item.contactPerson,
      contactPhone: item.contactPhone,
      email: item.email,
      status: item.status,
      dealer: item.dealer?._id || dealerId || '',
      username: item.username || '',
      password: '',
    });
    setIsEditing(true);
    setShowModal(true);
    fetchCities(item.state);
    fetchLocations(item.state, item.district);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelected(null);
    setIsEditing(false);
    setNewItem({
      name: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      district: '',
      location: '',
      pincode: '',
      phone: '',
      contactPerson: '',
      contactPhone: '',
      email: '',
      status: 'Active',
      dealer: dealerId || '',
      username: '',
      password: '',
    });
    setLocations([]);
  };

  const filtered = useMemo(() => {
    return subDealers.filter(
      (sd) =>
        (sd.name && sd.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.subDealerId &&
          sd.subDealerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.addressLine1 &&
          sd.addressLine1.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.addressLine2 &&
          sd.addressLine2.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.state &&
          sd.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.district &&
          sd.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.pincode && sd.pincode.toString().includes(searchTerm)) ||
        (sd.phone &&
          sd.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sd.contactPerson &&
          sd.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subDealers, searchTerm]);

  const totalPages = useMemo(
    () => Math.ceil(filtered.length / itemsPerPage),
    [filtered, itemsPerPage]
  );
  const currentItems = useMemo(() => {
    const idxLast = currentPage * itemsPerPage;
    const idxFirst = idxLast - itemsPerPage;
    return filtered.slice(idxFirst, idxLast);
  }, [filtered, currentPage, itemsPerPage]);

  const handleSelect = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const handleSelectAll = (e) =>
    setSelectedItems(e.target.checked ? subDealers.map((s) => s._id) : []);

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedItems.length} selected sub-dealers?`))
      return;
    try {
      await axios.delete(`${API_URL}/sub-dealers`, {
        data: { subDealerIds: selectedItems },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Deleted successfully');
      fetchSubDealers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sub-dealer?')) return;
    try {
      await axios.delete(`${API_URL}/dealer/sub-dealers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Deleted');
      fetchSubDealers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting');
    }
  };

  const handleViewProducts = (subDealer) => {
    setSelectedSubDealer(subDealer);
    setShowProductsModal(true);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 min-h-full">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          My Sub Dealers
        </h1>
        <p className="text-sm text-gray-600">
          Total {filtered.length} sub-dealers
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TableExportButtons
                exportName="Dealer_SubDealers"
                exportData={filtered.map(sd => ({
                  'ID': sd.subDealerId,
                  'Name': sd.name,
                  'Contact Person': sd.contactPerson,
                  'Contact Phone': sd.contactPhone,
                  'Status': sd.status
                }))}
              />
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Sub-Dealer</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your sub-dealers...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="mt-4 text-gray-500">
              No sub-dealers match your criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <SubDealerTable
                currentItems={currentItems}
                selectedItems={selectedItems}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onViewProducts={handleViewProducts}
              />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {currentItems.map((dealer) => (
                <div
                  key={dealer._id}
                  className="bg-gray-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {dealer.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {dealer.subDealerId}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditClick(dealer)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(dealer._id)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {dealer.district},{' '}
                      {dealer.state}{' '}
                      {dealer.pincode ? `- ${dealer.pincode}` : ''}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {dealer.contactPerson}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {dealer.contactPhone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {dealer.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewProducts(dealer)}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Package className="h-4 w-4" />
                    View Products
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {filtered.length > itemsPerPage && (
          <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm text-gray-700 hidden sm:inline">
                Showing{' '}
                {currentItems.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{' '}
                to {Math.min(currentPage * itemsPerPage, filtered.length)} of{' '}
                {filtered.length} sub-dealers
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 flex-shrink-0">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <SubDealerForm
          newItem={newItem}
          setNewItem={setNewItem}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          dealers={[
            {
              _id: dealerId,
              name: user?.dealer?.name || user?.name || 'My Dealer',
            },
          ]}
          states={states}
          cities={cities}
          locations={locations}
          fetchCities={fetchCities}
          fetchLocations={fetchLocations}
          onCancel={handleModalClose}
          onSubmit={handleAddEdit}
        />
      )}

      {showProductsModal && selectedSubDealer && (
        <SubDealerProductsModal
          subDealer={selectedSubDealer}
          onClose={() => {
            setShowProductsModal(false);
            setSelectedSubDealer(null);
          }}
        />
      )}
    </div>
  );
}
