import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, X, Trash2 } from 'lucide-react';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SubDealerForm from './components/SubDealerForm';
import SubDealerTable from './components/SubDealerTable';
import SubDealerProductsModal from '../DealersPanel/SubDealerProductsModal';
import SalesModal from './components/SalesModal';
import TableExportButtons from '../../global/TableExportButtons';

function SubDealers() {
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
  const [dealers, setDealers] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedSubDealer, setSelectedSubDealer] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [subDealerSales, setSubDealerSales] = useState([]);
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
    dealer: '',
    username: '',
    password: '',
  });

  const [cities, setCities] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  const fetchSubDealers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/sub-dealers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const sortedData = data.sort((a
        , b) => {
        if (!a.name) return 1;
        if (!b.name) return -1;
        return a.name.localeCompare(b.name);
      });
      setSubDealers(sortedData);
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
    const fetchDealers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/dealers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDealers(data);
      } catch (error) {
        console.error('Error fetching dealers', error);
      }
    };
    fetchDealers();

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

  // Fetch cities when newItem.state changes
  useEffect(() => {
    if (newItem.state) {
      fetchCities(newItem.state);
    } else {
      setCities([]); // Clear cities if state is cleared
      setLocations([]); // Clear locations too
    }
  }, [newItem.state]);

  // Fetch locations when newItem.district changes
  useEffect(() => {
    if (newItem.state && newItem.district) {
      fetchLocations(newItem.state, newItem.district);
    } else {
      setLocations([]); // Clear locations if district is cleared
    }
  }, [newItem.state, newItem.district]); // newItem.state also a dependency for safety

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
        await axios.put(`${API_URL}/sub-dealers/${selected._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Sub-dealer updated successfully');
      } else {
        await axios.post(`${API_URL}/sub-dealers`, dataToSend, {
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
    const districtName =
      typeof item.district === 'object' && item.district !== null
        ? item.district.name
        : item.district;
    setNewItem({
      name: item.name,
      addressLine1: item.addressLine1,
      addressLine2: item.addressLine2,
      state: item.state,
      district: districtName || '',
      location: item.location,
      pincode: item.pincode || '',
      phone: item.phone || '',
      contactPerson: item.contactPerson,
      contactPhone: item.contactPhone,
      email: item.email,
      status: item.status,
      dealer: item.dealer?._id || '',
      username: item.username || '',
      password: '',
    });
    setIsEditing(true);
    setShowModal(true);
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
      dealer: '',
      username: '',
      password: '',
    });
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
      await axios.delete(`${API_URL}/sub-dealers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Deleted');
      fetchSubDealers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting');
    }
  };

  const handleViewInventory = (subDealer) => {
    setSelectedSubDealer(subDealer);
    setShowProductsModal(true);
  };

  const handleViewSales = async (subDealer) => {
    try {
      setSelectedSubDealer(subDealer);
      const { data } = await axios.get(`${API_URL}/sub-dealers/${subDealer._id}/sales`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSubDealerSales(data);
      setShowSalesModal(true);
    } catch (error) {
      toast.error('Error fetching sub-dealer sales');
    }
  };

  return (
    <div className="p-2">
      <div className="p-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sub Dealers
                </h2>
                <p className="text-sm text-gray-600">Total {filtered.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected ({selectedItems.length})</span>
                  </button>
                )}
                <TableExportButtons
                  exportName="SubDealers_List"
                  exportData={filtered.map(sd => ({
                    'ID': sd.subDealerId,
                    'Name': sd.name,
                    'District': sd.district,
                    'Dealer': sd.dealer?.name || 'N/A',
                    'Products Count': sd.productCount || 0
                  }))}
                />
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Sub-Dealer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : subDealers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No sub-dealers found.
              </div>
            ) : (
              <>
                <SubDealerTable
                  allFilteredSubDealers={filtered}
                  currentItems={currentItems}
                  selectedItems={selectedItems}
                  onSelect={handleSelect}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  onViewSales={handleViewSales}
                  onViewInventory={handleViewInventory}
                />

                <div className="md:hidden space-y-4">
                  {subDealers.length > 0 ? (
                    <ListComponent
                      items={subDealers}
                      renderItem={(dealer) => (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              {dealer.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditClick(dealer)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-5 h-5 text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDelete(dealer._id)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {dealer.subDealerId}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">
                                Address Line 1:
                              </span>{' '}
                              {dealer.addressLine1}
                            </div>
                            {dealer.addressLine2 && (
                              <div>
                                <span className="font-medium">
                                  Address Line 2:
                                </span>{' '}
                                {dealer.addressLine2}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">State:</span>{' '}
                              {dealer.state}
                            </div>
                            <div>
                              <span className="font-medium">District:</span>{' '}
                              {dealer.district}
                            </div>
                            <div>
                              <span className="font-medium">Pincode:</span>{' '}
                              {dealer.pincode}
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span>{' '}
                              {dealer.contactPerson}
                            </div>
                          </div>
                        </div>
                      )}
                      itemContainer="div"
                      listContainer="div"
                      listClassName="space-y-4"
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No sub-dealers found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {subDealers.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0">
              <div className="w-full md:w-auto flex items-center justify-between md:justify-start text-sm text-gray-700 space-x-2">
                <div className="flex items-center space-x-2">
                  <span className="whitespace-nowrap">Rows per page:</span>
                  <select
                    className="ml-2 border border-gray-300 rounded px-2 py-1"
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
                <div className="hidden md:block text-sm text-gray-700">
                  Showing{' '}
                  {currentItems.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{' '}
                  to {Math.min(currentPage * itemsPerPage, subDealers.length)}{' '}
                  of {subDealers.length} sub-dealers
                </div>
              </div>

              <div className="w-full md:w-auto flex items-center justify-between md:justify-end space-x-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 hidden md:inline">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SubDealerForm
          newItem={newItem}
          setNewItem={setNewItem}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          dealers={dealers}
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
          isAdmin={true}
        />
      )}

      <SalesModal
        isOpen={showSalesModal}
        subDealer={selectedSubDealer}
        sales={subDealerSales}
        onClose={() => {
          setShowSalesModal(false);
          setSelectedSubDealer(null);
          setSubDealerSales([]);
        }}
        modalCurrentPage={currentPage}
        modalItemsPerPage={itemsPerPage}
        onModalPageChange={setCurrentPage}
        onModalItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}

export default function SubDealersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SubDealers />
    </ErrorBoundary>
  );
}
