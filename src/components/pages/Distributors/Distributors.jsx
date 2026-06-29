import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, FilePenLine, Trash2, Box } from 'lucide-react';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DistributorProductGroupList from './components/DistributorProductGroupList';

// Import modular components
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import DistributorTable from './components/DistributorTable';
import DistributorCard from './components/DistributorCard';
import DistributorModal from './components/DistributorModal';
import ProductsModal from './components/ProductsModal';
import SalesModal from './components/SalesModal';
import ModelModal from './components/ModelModal';
import DealersModal from './components/DealersModal';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributors`;

function Distributors() {
  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [showDistributorModal, setShowDistributorModal] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [distributorProducts, setDistributorProducts] = useState([]);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [distributorSales, setDistributorSales] = useState([]);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalItemsPerPage, setModalItemsPerPage] = useState(10);
  const [showDealersModal, setShowDealersModal] = useState(false);
  const [distributorDealers, setDistributorDealers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newDistributor, setNewDistributor] = useState({
    name: '',
    state: '',
    district: '',
    location: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    gstNumber: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    status: 'Active',
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
      setLocations([]);
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

  const totalPages = useMemo(
    () => Math.ceil(distributors.length / itemsPerPage),
    [distributors, itemsPerPage]
  );
  const paginatedDistributors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return distributors.slice(startIndex, startIndex + itemsPerPage);
  }, [distributors, currentPage, itemsPerPage]);

  // Fetch distributors
  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        searchTerm ? `${API_URL}?search=${searchTerm}` : API_URL
      );
      setDistributors(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error fetching distributors'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      fetchDistributors();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm]);

  // Fetch districts when newDistributor.state changes
  useEffect(() => {
    if (newDistributor.state) {
      fetchDistricts(newDistributor.state);
    } else {
      setCities([]); // Clear cities if state is cleared
      setLocations([]); // Clear locations too
    }
  }, [newDistributor.state]);

  // Fetch locations when newDistributor.district changes
  useEffect(() => {
    if (newDistributor.state && newDistributor.district) {
      fetchLocations(newDistributor.state, newDistributor.district);
    } else {
      setLocations([]); // Clear locations if district is cleared
    }
  }, [newDistributor.state, newDistributor.district]);

  const handleAddDistributor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL, newDistributor);
      setDistributors([...distributors, response.data]);
      handleModalClose();
      toast.success('Distributor added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding distributor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDistributor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${API_URL}/${selectedDistributor._id}`,
        newDistributor
      );
      setDistributors(
        distributors.map((d) =>
          d._id === selectedDistributor._id ? response.data : d
        )
      );
      handleModalClose();
      toast.success('Distributor updated successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error updating distributor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDistributor = async (distributorId) => {
    if (window.confirm('Are you sure you want to delete this distributor?')) {
      try {
        await axios.delete(`${API_URL}/${distributorId}`);
        setDistributors(distributors.filter((d) => d._id !== distributorId));
        toast.success('Distributor deleted successfully');
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Error deleting distributor'
        );
      }
    }
  };

  const handleEditClick = (distributor) => {
    setSelectedDistributor(distributor);
    const districtName =
      typeof distributor.district === 'object' && distributor.district !== null
        ? distributor.district.name
        : distributor.district;
    setNewDistributor({
      ...distributor,
      state: distributor.state || '',
      district: districtName || '',
      location: distributor.location || '',
    });
    setIsEditing(true);
    setShowDistributorModal(true);
  };
  const handleModalClose = () => {
    setShowDistributorModal(false);
    setSelectedDistributor(null);
    setIsEditing(false);
    setNewDistributor({
      name: '',
      state: '',
      district: '',
      location: '',
      address: '',
      gstNumber: '',
      contactPerson: '',
      contactPhone: '',
      email: '',
      username: '',
      password: '',
      status: 'Active',
    });
  };

  const handleViewInventory = async (distributor) => {
    try {
      const productsResponse = await axios.get(`${API_URL}/${distributor._id}/products`);
      setDistributorProducts(productsResponse.data);
      setSelectedDistributor(distributor);
      setShowProductsModal(true);
    } catch (error) {
      toast.error('Error fetching distributor inventory');
      console.error('Error:', error);
    }
  };

  const handleViewSales = async (distributor) => {
    try {
      const salesResponse = await axios.get(`${API_URL}/${distributor._id}/sales`);
      setDistributorSales(salesResponse.data);
      setSelectedDistributor(distributor);
      setShowSalesModal(true);
    } catch (error) {
      toast.error('Error fetching distributor sales');
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

  const handleStatusChange = async (distributorId, newStatus) => {
    try {
      const response = await axios.patch(`${API_URL}/${distributorId}/status`, {
        status: newStatus,
      });
      setDistributors(
        distributors.map((d) => (d._id === distributorId ? response.data : d))
      );
      toast.success('Distributor status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleViewDealers = async (distributor) => {
    try {
      const { data } = await axios.get(`${API_URL}/${distributor._id}/dealers`);
      setDistributorDealers(data);
      setSelectedDistributor(distributor);
      setShowDealersModal(true);
    } catch (error) {
      toast.error('Error fetching distributor dealers');
      console.error('Error:', error);
    }
  };

  const handleSelect = (id) => {
    setSelectedDistributors((prev) =>
      prev.includes(id)
        ? prev.filter((distributorId) => distributorId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select only the distributors visible on the current page
      setSelectedDistributors(paginatedDistributors.map((d) => d._id));
    } else {
      setSelectedDistributors([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedDistributors.length} selected distributors?`
      )
    ) {
      try {
        await axios.delete(API_URL, {
          data: { distributorIds: selectedDistributors },
        });
        fetchDistributors();
        setSelectedDistributors([]);
        toast.success('Selected distributors deleted successfully');
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Error deleting distributors'
        );
      }
    }
  };

  return (
    <div className="p-2">
      <div className="p-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Distributor List
                </h2>
                <p className="text-sm text-gray-600">
                  Total {distributors.length}
                </p>
              </div>
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search distributors"
                />
                {selectedDistributors.length > 0 ? (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedDistributors.length})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDistributorModal(true)}
                    className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Distributor</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading distributors...</p>
              </div>
            ) : (
              <>
                {distributors.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No distributors found
                  </div>
                ) : (
                  <>
                    <DistributorTable
                      distributors={paginatedDistributors}
                      selectedDistributors={selectedDistributors}
                      onSelect={handleSelect}
                      onSelectAll={handleSelectAll}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteDistributor}
                      onViewSales={handleViewSales}
                      onViewInventory={handleViewInventory}
                      onViewDealers={handleViewDealers}
                    />

                    <DistributorCard
                      distributors={paginatedDistributors}
                      selectedDistributors={selectedDistributors}
                      onSelect={handleSelect}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteDistributor}
                      onViewSales={handleViewSales}
                      onViewInventory={handleViewInventory}
                      onViewDealers={handleViewDealers}
                      onStatusChange={handleStatusChange}
                    />
                  </>
                )}
              </>
            )}
          </div>
          {distributors.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={distributors.length}
              onPageChange={(page) => {
                setSelectedDistributors([]);
                setCurrentPage(page);
              }}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setSelectedDistributors([]);
                setCurrentPage(1);
              }}
              showItemCount={true}
            />
          )}
        </div>
      </div>

      <DistributorModal
        isOpen={showDistributorModal}
        isEditing={isEditing}
        distributor={newDistributor}
        states={states}
        cities={cities}
        locations={locations}
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
        onSubmit={isEditing ? handleEditDistributor : handleAddDistributor}
        onChange={(updatedDistributor) => setNewDistributor(updatedDistributor)}
        onStateChange={(state) => {
          setNewDistributor({
            ...newDistributor,
            state,
            district: '',
            location: '',
            pincode: '',
          });
          fetchDistricts(state);
        }}
        onDistrictChange={(state, district) => {
          setNewDistributor({
            ...newDistributor,
            district,
            location: '',
            pincode: '',
          });
          fetchLocations(state, district);
        }}
        onLocationChange={(location) => {
          const selectedLocation = locations.find(
            (loc) => loc.location === location
          );
          if (selectedLocation) {
            setNewDistributor({
              ...newDistributor,
              location: selectedLocation.location,
              pincode: selectedLocation.pincode,
            });
          } else {
            setNewDistributor({
              ...newDistributor,
              location,
              pincode: '',
            });
          }
        }}
      />

      <ProductsModal
        isOpen={showProductsModal}
        distributor={selectedDistributor}
        products={distributorProducts}
        onClose={() => {
          setShowProductsModal(false);
          setSelectedDistributor(null);
          setDistributorProducts([]);
        }}
        onOpenModel={openModelModal}
        modalCurrentPage={modalCurrentPage}
        modalItemsPerPage={modalItemsPerPage}
        onModalPageChange={setModalCurrentPage}
        onModalItemsPerPageChange={setModalItemsPerPage}
      />

      <SalesModal
        isOpen={showSalesModal}
        distributor={selectedDistributor}
        sales={distributorSales}
        onClose={() => {
          setShowSalesModal(false);
          setSelectedDistributor(null);
          setDistributorSales([]);
        }}
        modalCurrentPage={modalCurrentPage}
        modalItemsPerPage={modalItemsPerPage}
        onModalPageChange={setModalCurrentPage}
        onModalItemsPerPageChange={setModalItemsPerPage}
      />

      <ModelModal
        isOpen={isModelModalOpen}
        activeModelId={activeModelId}
        products={distributorProducts}
        onClose={closeModelModal}
        modalCurrentPage={modalCurrentPage}
        modalItemsPerPage={modalItemsPerPage}
        onModalPageChange={setModalCurrentPage}
        onModalItemsPerPageChange={setModalItemsPerPage}
      />

      <DealersModal
        isOpen={showDealersModal}
        distributor={selectedDistributor}
        dealers={distributorDealers}
        onClose={() => {
          setShowDealersModal(false);
          setSelectedDistributor(null);
          setDistributorDealers([]);
        }}
      />
    </div>
  );
}

export default function DistributorsWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Distributors />
    </ErrorBoundary>
  );
}
