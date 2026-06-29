import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ErrorBoundary from '../../global/ErrorBoundary';
import { useDealers } from './hooks/useDealers';
import { distributorDealerProductService } from '../../../services/distributorDealerProductService';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { dealerService } from './services/dealerService';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import DealerTable from './components/DealerTable';
import DealerCard from './components/DealerCard';
import DealerModal from './components/DealerModal';
import ProductsModal from './components/ProductsModal';
import ModelModal from './components/ModelModal';
import SubDealersModal from './components/SubDealersModal';

function Dealers() {
  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };
  const {
    searchTerm,
    setSearchTerm,
    dealers,
    loading,
    distributors,
    addDealer,
    updateDealer,
    deleteDealer,
  } = useDealers();

  const [showDealerModal, setShowDealerModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [dealerProducts, setDealerProducts] = useState([]);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showSubDealersModal, setShowSubDealersModal] = useState(false);
  const [subDealersForDealer, setSubDealersForDealer] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [distributorFilter, setDistributorFilter] = useState('all');

  const filteredItems = useMemo(() => {
    let result = dealers;
    if (distributorFilter !== 'all') {
      result = result.filter(d => d.distributor?._id === distributorFilter || d.distributor === distributorFilter);
    }
    return result;
  }, [dealers, distributorFilter]);

  const totalPages = useMemo(
    () => Math.ceil(filteredItems.length / itemsPerPage),
    [filteredItems, itemsPerPage]
  );
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, currentPage, itemsPerPage]);

  const [newDealer, setNewDealer] = useState({
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
    distributor: '',
    username: '',
    password: '',
  });

  useEffect(() => {
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

  const fetchDistricts = async (state) => {
    if (!state) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/locations/districts/${state}`
      );
      setCities(response.data);
      setLocations([]); // Clear locations when state changes
    } catch (error) {
      console.error(`Error fetching districts for ${state}:`, error);
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

  // Fetch districts when newDealer.state changes
  useEffect(() => {
    if (newDealer.state) {
      fetchDistricts(newDealer.state);
    } else {
      setCities([]); // Clear cities if state is cleared
      setLocations([]); // Clear locations too
    }
  }, [newDealer.state]);

  // Fetch locations when newDealer.district changes
  useEffect(() => {
    if (newDealer.state && newDealer.district) {
      fetchLocations(newDealer.state, newDealer.district);
    } else {
      setLocations([]); // Clear locations if district is cleared
    }
  }, [newDealer.state, newDealer.district]);

  const handleAddEditDealer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success;
    if (isEditing) {
      success = await updateDealer(selectedDealer._id, newDealer);
    } else {
      success = await addDealer(newDealer);
    }
    if (success) {
      handleModalClose();
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (dealer) => {
    setSelectedDealer(dealer);
    const districtName =
      typeof dealer.district === 'object' && dealer.district !== null
        ? dealer.district.name
        : dealer.district;
    setNewDealer({
      name: dealer.name,
      addressLine1: dealer.addressLine1,
      addressLine2: dealer.addressLine2,
      state: dealer.state,
      district: districtName || '',
      location: dealer.location,
      pincode: dealer.pincode,
      phone: dealer.phone,
      contactPerson: dealer.contactPerson,
      contactPhone: dealer.contactPhone,
      email: dealer.email,
      status: dealer.status,
      distributor: dealer.distributor?._id || '', // Note: district can be object here too, similar to distributor
      username: dealer.username || '',
      password: '',
    });
    setIsEditing(true);
    setShowDealerModal(true);
  };

  const handleModalClose = () => {
    setShowDealerModal(false);
    setSelectedDealer(null);
    setIsEditing(false);
    setNewDealer({
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
      distributor: '',
      username: '',
      password: '',
    });
  };

  const handleViewProducts = async (dealer) => {
    try {
      const { data } = await distributorDealerProductService.getDealerProducts(
        dealer._id
      );
      setDealerProducts(data);
      setSelectedDealer(dealer);
      setShowProductsModal(true);
    } catch (error) {
      toast.error('Error fetching dealer products');
      console.error('Error:', error);
    }
  };

  const openModelModal = (modelId) => {
    setActiveModelId(modelId);
    setModalCurrentPage(1);
    setIsModelModalOpen(true);
  };

  const closeModelModal = () => {
    setIsModelModalOpen(false);
    setActiveModelId(null);
  };

  const handleViewSubDealers = async (dealer) => {
    try {
      const res = await dealerService.fetchSubDealers(dealer._id);
      setSubDealersForDealer(res.data || []);
      setSelectedDealer(dealer);
      setShowSubDealersModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error fetching sub-dealers'
      );
      console.error(error);
    }
  };

  const handleSelect = (id) => {
    setSelectedDealers((prev) =>
      prev.includes(id)
        ? prev.filter((dealerId) => dealerId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDealers(dealers.map((d) => d._id));
    } else {
      setSelectedDealers([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedDealers.length} selected dealers?`
      )
    ) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/dealers`, {
          data: { dealerIds: selectedDealers },
        });
        window.location.reload();
        toast.success('Selected dealers deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting dealers');
      }
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
                  Dealer List
                </h2>
                <p className="text-sm text-gray-600">Total {filteredItems.length}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
                <select
                  value={distributorFilter}
                  onChange={(e) => {
                    setDistributorFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Distributors</option>
                  {distributors.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {selectedDealers.length > 0 ? (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedDealers.length})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDealerModal(true)}
                    className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Dealer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading dealers...</p>
              </div>
            ) : dealers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No dealers found.
              </div>
            ) : (
              <>
                <DealerTable
                  dealers={currentItems}
                  selectedDealers={selectedDealers}
                  onSelect={handleSelect}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEditClick}
                  onDelete={deleteDealer}
                  onViewProducts={handleViewProducts}
                  onViewSubDealers={handleViewSubDealers}
                />

                <DealerCard
                  dealers={filteredItems}
                  onEdit={handleEditClick}
                  onDelete={deleteDealer}
                />
              </>
            )}
          </div>
          {filteredItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredItems.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>

      <DealerModal
        isOpen={showDealerModal}
        isEditing={isEditing}
        dealer={selectedDealer}
        newDealer={newDealer}
        onDealerChange={setNewDealer}
        onSubmit={handleAddEditDealer}
        onClose={handleModalClose}
        states={states}
        cities={cities}
        locations={locations}
        distributors={distributors}
        isSubmitting={isSubmitting}
      />

      <ProductsModal
        isOpen={showProductsModal}
        dealer={selectedDealer}
        dealerProducts={dealerProducts}
        onClose={() => {
          setShowProductsModal(false);
          setSelectedDealer(null);
          setDealerProducts([]);
        }}
        onViewModel={openModelModal}
        modalCurrentPage={modalCurrentPage}
        modalItemsPerPage={modalItemsPerPage}
        onPageChange={setModalCurrentPage}
        onItemsPerPageChange={setModalItemsPerPage}
      />

      <ModelModal
        isOpen={isModelModalOpen}
        activeModelId={activeModelId}
        dealerProducts={dealerProducts}
        modalCurrentPage={modalCurrentPage}
        modalItemsPerPage={modalItemsPerPage}
        onClose={closeModelModal}
        onPageChange={setModalCurrentPage}
        onItemsPerPageChange={setModalItemsPerPage}
      />

      <SubDealersModal
        isOpen={showSubDealersModal}
        dealer={selectedDealer}
        subDealers={subDealersForDealer}
        onClose={() => {
          setShowSubDealersModal(false);
          setSelectedDealer(null);
          setSubDealersForDealer([]);
        }}
      />
    </div>
  );
}

export default function DealersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Dealers />
    </ErrorBoundary>
  );
}
