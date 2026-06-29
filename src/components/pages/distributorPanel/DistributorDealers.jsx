import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Search, Plus, X, FilePenLine, Trash2, Box } from 'lucide-react';
import ListComponent from '../../global/ListComponent';
import ErrorBoundary from '../../global/ErrorBoundary';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import TableExportButtons from '../../global/TableExportButtons';
import { AuthContext } from '../../../context/AuthContext';

function DistributorDealers() {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDealerModal, setShowDealerModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [states, setStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState(null);
  const [showSubDealersModal, setShowSubDealersModal] = useState(false);
  const [selectedDealerSubDealers, setSelectedDealerSubDealers] = useState([]);
  const [selectedDealerForSubDealers, setSelectedDealerForSubDealers] =
    useState(null);
  const [showDealerProductsModal, setShowDealerProductsModal] = useState(false);
  const [selectedDealerProducts, setSelectedDealerProducts] = useState([]);
  const [selectedDealerForProducts, setSelectedDealerForProducts] =
    useState(null);
  const [productModalCurrentPage, setProductModalCurrentPage] = useState(1);
  const [productModalItemsPerPage, setProductModalItemsPerPage] = useState(10);
  const [isProductModelModalOpen, setIsProductModelModalOpen] = useState(false);
  const [activeProductModelId, setActiveProductModelId] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  // Validate phone input - only numbers allowed
  const handlePhoneChange = (value) => {
    // Remove any non-numeric characters
    const numericOnly = value.replace(/[^0-9]/g, '');

    // Check if user tried to enter non-numeric characters
    if (value !== numericOnly && value.length > 0) {
      setPhoneError('Phone number must contain only numbers');
    } else if (numericOnly.length > 0 && numericOnly.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else if (numericOnly.length === 10) {
      setPhoneError('');
    } else {
      setPhoneError('');
    }

    // Update the dealer object with numeric value only
    setNewDealer({ ...newDealer, contactPhone: numericOnly });
  };

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  const [newDealer, setNewDealer] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    district: '',
    location: '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    status: 'Active',
    username: '',
    password: '',
  });

  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/dealers`;

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/distributors/${user.distributor._id}/dealers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setDealers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching dealers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.distributor?._id) {
      fetchDealers();
    }
  }, [user]);

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

  const fetchCities = async (state) => {
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

  // Fetch cities when newDealer.state changes
  useEffect(() => {
    if (newDealer.state) {
      fetchCities(newDealer.state);
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
  }, [newDealer.state, newDealer.district]); // newDealer.state also a dependency for safety

  const handleAddEditDealer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/distributors/${user.distributor._id}/dealers/${selectedDealer._id}`,
          newDealer,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Dealer updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/distributors/${user.distributor._id}/dealers`,
          newDealer,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Dealer added successfully');
      }
      fetchDealers();
      handleModalClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving dealer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestDeleteDealer = (dealer) => {
    setDealerToDelete(dealer);
    setShowDeleteRequestModal(true);
  };

  const sendDeletionRequest = async () => {
    if (!dealerToDelete) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dealer-deletion-requests`,
        {
          dealerId: dealerToDelete._id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast.success('Deletion request sent to admin!');
      fetchDealers(); // Refresh the list to show pending status if implemented
      setShowDeleteRequestModal(false);
      setDealerToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to send deletion request'
      );
    }
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
      contactPerson: dealer.contactPerson,
      contactPhone: dealer.contactPhone,
      email: dealer.email,
      status: dealer.status,
      username: dealer.username || '',
      password: '', // Keep password empty for security
    });
    setIsEditing(true);
    setShowDealerModal(true);
    // Removed direct calls to fetchCities and fetchLocations,
    // as these will now be handled by useEffect based on newDealer state changes.
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
      contactPerson: '',
      contactPhone: '',
      email: '',
      status: 'Active',
      username: '',
      password: '',
    });
    setLocations([]);
    setPhoneError('');
  };

  const handleViewSubDealers = async (dealer) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dealers/${dealer._id}/sub-dealers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSelectedDealerSubDealers(response.data);
      setSelectedDealerForSubDealers(dealer);
      setShowSubDealersModal(true);
    } catch (error) {
      toast.error('Error fetching sub-dealers');
      console.error('Error:', error);
    }
  };

  const handleViewDealerProducts = async (dealer) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer/${dealer._id}/products`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSelectedDealerProducts(response.data);
      setSelectedDealerForProducts(dealer);
      setShowDealerProductsModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error fetching dealer products'
      );
      console.error('Error fetching dealer products:', error);
    }
  };

  const filteredDealers = useMemo(() => {
    return dealers.filter(
      (dealer) =>
        (dealer.name &&
          dealer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dealer.dealerId &&
          dealer.dealerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dealer.addressLine1 &&
          dealer.addressLine1
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (dealer.addressLine2 &&
          dealer.addressLine2
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (dealer.state &&
          dealer.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dealer.district &&
          dealer.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dealer.pincode &&
          dealer.pincode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dealer.contactPerson &&
          dealer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [dealers, searchTerm]);

  const totalPages = useMemo(
    () => Math.ceil(filteredDealers.length / itemsPerPage),
    [filteredDealers, itemsPerPage]
  );
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredDealers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredDealers, currentPage, itemsPerPage]);

  const dealerModelGroups = useMemo(() => {
    const groups = {};
    selectedDealerProducts.forEach((assignment) => {
      const prod = assignment.product;
      if (!prod) return;
      const mid = prod.model?._id || 'unknown';
      if (!groups[mid]) {
        groups[mid] = {
          model: prod.model || { name: 'Unknown', _id: mid },
          count: 0,
          items: [],
        };
      }
      groups[mid].count += 1;
      groups[mid].items.push(assignment);
    });
    return Object.values(groups).sort((a, b) => (a.model?.name || '').localeCompare(b.model?.name || ''));
  }, [selectedDealerProducts]);

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                My Dealers
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Total {filteredDealers.length}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <TableExportButtons
                exportName="Distributor_Dealers"
                exportData={filteredDealers.map(dealer => ({
                  'ID': dealer.dealerId,
                  'Name': dealer.name,
                  'Contact Person': dealer.contactPerson,
                  'Contact Phone': dealer.contactPhone,
                  'Products': typeof dealer.productCount !== 'undefined' ? dealer.productCount : (dealer.products ? dealer.products.length : 0),
                  'Sub-Dealers': typeof dealer.subDealerCount !== 'undefined' ? dealer.subDealerCount : (dealer.subDealers ? dealer.subDealers.length : 0),
                  'Status': dealer.status
                }))}
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={() => setShowDealerModal(true)}
                className="flex items-center justify-center gap-2 bg-[#4d55f5] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Dealer</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">Loading dealers...</p>
            </div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No dealers found.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub-Dealers
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <ListComponent
                    items={currentItems}
                    renderItem={(dealer) => (
                      <>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                          {dealer.dealerId}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                          {dealer.name}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                          <div>
                            <p>{dealer.contactPerson}</p>
                            <p className="text-gray-500">
                              {dealer.contactPhone}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${dealer.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {dealer.status}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewSubDealers(dealer)}
                            className="inline-flex items-center px-2 lg:px-2.5 py-1 lg:py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                          >
                            <Box className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                            <span className="hidden lg:inline">
                              {typeof dealer.subDealerCount !== 'undefined'
                                ? dealer.subDealerCount
                                : dealer.subDealers
                                  ? dealer.subDealers.length
                                  : 0}{' '}
                              Sub-Dealers
                            </span>
                            <span className="lg:hidden">
                              {typeof dealer.subDealerCount !== 'undefined'
                                ? dealer.subDealerCount
                                : dealer.subDealers
                                  ? dealer.subDealers.length
                                  : 0}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDealerProducts(dealer)}
                            className="inline-flex items-center px-2 lg:px-2.5 py-1 lg:py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Box className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                            <span className="hidden lg:inline">
                              {typeof dealer.productCount !== 'undefined'
                                ? dealer.productCount
                                : dealer.products
                                  ? dealer.products.length
                                  : 0}{' '}
                              Products
                            </span>
                            <span className="lg:hidden">
                              {typeof dealer.productCount !== 'undefined'
                                ? dealer.productCount
                                : dealer.products
                                  ? dealer.products.length
                                  : 0}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                          <div className="flex items-center space-x-1 lg:space-x-2">
                            <button
                              onClick={() => handleEditClick(dealer)}
                              className="p-1.5 lg:p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <FilePenLine
                                size={16}
                                className="text-gray-500 lg:w-5 lg:h-5"
                              />
                            </button>
                            <button
                              onClick={() => handleRequestDeleteDealer(dealer)}
                              className="p-1.5 lg:p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Trash2
                                size={16}
                                className="text-red-500 lg:w-5 lg:h-5"
                              />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    itemContainer="tr"
                    listContainer="tbody"
                    itemClassName="hover:bg-gray-50"
                    listClassName="bg-white divide-y divide-gray-200"
                  />
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {currentItems.map((dealer) => (
                  <div
                    key={dealer._id}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {dealer.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          ID: {dealer.dealerId}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${dealer.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {dealer.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">
                          Address Line 1:
                        </span>
                        <p className="text-gray-900">{dealer.addressLine1}</p>
                      </div>
                      {dealer.addressLine2 && (
                        <div>
                          <span className="font-medium text-gray-600">
                            Address Line 2:
                          </span>
                          <p className="text-gray-900">{dealer.addressLine2}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium text-gray-600">
                            State:
                          </span>
                          <p className="text-gray-900">{dealer.state}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            District:
                          </span>
                          <p className="text-gray-900">{dealer.district}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Pincode:
                          </span>
                          <p className="text-gray-900">{dealer.pincode}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Contact:
                        </span>
                        <p className="text-gray-900">{dealer.contactPerson}</p>
                        <p className="text-gray-600">{dealer.contactPhone}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewSubDealers(dealer)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                      >
                        <Box className="h-4 w-4" />
                        {typeof dealer.subDealerCount !== 'undefined'
                          ? dealer.subDealerCount
                          : dealer.subDealers
                            ? dealer.subDealers.length
                            : 0}{' '}
                        Sub-Dealers
                      </button>
                      <button
                        onClick={() => handleViewDealerProducts(dealer)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Box className="h-4 w-4" />
                        {typeof dealer.productCount !== 'undefined'
                          ? dealer.productCount
                          : dealer.products
                            ? dealer.products.length
                            : 0}{' '}
                        Products
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(dealer)}
                          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
                        >
                          <FilePenLine size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleRequestDeleteDealer(dealer)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-xs sm:text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
                Showing{' '}
                {currentItems.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{' '}
                to{' '}
                {Math.min(currentPage * itemsPerPage, filteredDealers.length)}{' '}
                of {filteredDealers.length} dealers
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
                >
                  Previous
                </button>
                <span className="text-xs sm:text-sm text-gray-700 flex-shrink-0">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteRequestModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Request Dealer Deletion
              </h3>
              <button
                onClick={() => setShowDeleteRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to send a deletion request for dealer{' '}
              <span className="font-medium">{dealerToDelete?.name}</span> to the
              admin?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendDeletionRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showDealerModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Dealer' : 'Add New Dealer'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddEditDealer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDealer.name}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, name: e.target.value })
                    }
                    placeholder="Enter dealer name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flat/House No./Building Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDealer.addressLine1}
                    onChange={(e) =>
                      setNewDealer({
                        ...newDealer,
                        addressLine1: e.target.value,
                      })
                    }
                    placeholder="Flat/House No./Building Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Name/Landmark
                  </label>
                  <input
                    type="text"
                    value={newDealer.addressLine2}
                    onChange={(e) =>
                      setNewDealer({
                        ...newDealer,
                        addressLine2: e.target.value,
                      })
                    }
                    placeholder="Enter street name/landmark (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={newDealer.state}
                    onChange={(e) => {
                      setNewDealer({
                        ...newDealer,
                        state: e.target.value,
                        district: '',
                        location: '',
                        pincode: '',
                      });
                      fetchCities(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    required
                    value={newDealer.district}
                    onChange={(e) => {
                      setNewDealer({
                        ...newDealer,
                        district: e.target.value,
                        location: '',
                        pincode: '',
                      });
                      fetchLocations(newDealer.state, e.target.value);
                    }}
                    disabled={!newDealer.state}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  >
                    <option value="">Select District</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    required
                    value={newDealer.location}
                    onChange={(e) => {
                      const selectedLocation = locations.find(
                        (loc) => loc.location === e.target.value
                      );
                      if (selectedLocation) {
                        setNewDealer({
                          ...newDealer,
                          location: selectedLocation.location,
                          pincode: selectedLocation.pincode,
                        });
                      } else {
                        setNewDealer({
                          ...newDealer,
                          location: e.target.value,
                          pincode: '',
                        });
                      }
                    }}
                    disabled={!newDealer.district}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.location} value={loc.location}>
                        {loc.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDealer.pincode}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, pincode: e.target.value })
                    }
                    placeholder="Enter 6-digit pincode"
                    pattern="^\d{6}$"
                    maxLength="6"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDealer.contactPerson}
                    onChange={(e) =>
                      setNewDealer({
                        ...newDealer,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder="Enter contact person name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone No. *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newDealer.contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter Phone No."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${phoneError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#4d55f5]'
                      }`}
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="font-semibold">✕</span>
                      {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newDealer.email}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={newDealer.status}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username {!isEditing && '*'}
                  </label>
                  <input
                    type="text"
                    required={!isEditing}
                    value={newDealer.username}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, username: e.target.value })
                    }
                    placeholder={
                      isEditing
                        ? 'Leave blank to keep current username'
                        : 'Enter username'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    minLength={8}
                    value={newDealer.password}
                    onChange={(e) =>
                      setNewDealer({ ...newDealer, password: e.target.value })
                    }
                    placeholder={
                      isEditing
                        ? 'Leave blank to keep current password'
                        : 'Enter password'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : isEditing ? (
                    'Update Dealer'
                  ) : (
                    'Add Dealer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubDealersModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sub-Dealers for {selectedDealerForSubDealers?.name}
              </h3>
              <div className="flex items-center gap-4">
                {selectedDealerSubDealers.length > 0 && (
                  <TableExportButtons
                    exportName={`Dealer_${selectedDealerForSubDealers?.name || 'SubDealers'}_List`}
                    exportData={selectedDealerSubDealers.map(sd => ({
                      'ID': sd.subDealerId,
                      'Name': sd.name,
                      'Contact Person': sd.contactPerson,
                      'Contact Phone': sd.contactPhone,
                      'Location': `${sd.location}, ${sd.district}, ${sd.state} - ${sd.pincode}`,
                      'Status': sd.status
                    }))}
                  />
                )}
                <button
                  onClick={() => {
                    setShowSubDealersModal(false);
                    setSelectedDealerForSubDealers(null);
                    setSelectedDealerSubDealers([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              {selectedDealerSubDealers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sub-Dealer ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Contact Person
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDealerSubDealers.map((subDealer) => (
                        <tr key={subDealer._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {subDealer.subDealerId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {subDealer.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {subDealer.contactPerson}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {subDealer.contactPhone}
                          </td>
                          {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{subDealer.addressLine1} {subDealer.addressLine2}, {subDealer.state}, {subDealer.district} {subDealer.location} {subDealer.pincode}</td> */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {subDealer.state}, {subDealer.location},{' '}
                            {subDealer.pincode}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${subDealer.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {subDealer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sub-dealers found for this dealer
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDealerProductsModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Products for {selectedDealerForProducts?.name}
              </h3>
              <div className="flex items-center gap-4">
                {dealerModelGroups.length > 0 && (
                  <TableExportButtons
                    exportName={`Dealer_${selectedDealerForProducts?.name || 'Products'}_Models`}
                    exportData={dealerModelGroups.map(group => ({
                      'Model': group.model?.name || '-',
                      'No. of Products': group.count
                    }))}
                  />
                )}
                <button
                  onClick={() => {
                    setShowDealerProductsModal(false);
                    setSelectedDealerForProducts(null);
                    setSelectedDealerProducts([]);
                    setProductModalCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              {(() => {
                const totalProductPages = Math.ceil(
                  dealerModelGroups.length / productModalItemsPerPage
                );
                const paginatedModelGroups = dealerModelGroups.slice(
                  (productModalCurrentPage - 1) * productModalItemsPerPage,
                  productModalCurrentPage * productModalItemsPerPage
                );

                if (paginatedModelGroups.length > 0) {
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                MODEL
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                NO. OF PRODUCTS
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedModelGroups.map((group) => (
                              <tr key={group.model._id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {group.model.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setActiveProductModelId(group.model._id);
                                      setIsProductModelModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                  >
                                    <Box className="h-4 w-4 mr-1" />
                                    {group.count} Total Products
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {totalProductPages > 1 && (
                        <div className="p-3 sm:px-6 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-xs sm:text-sm text-gray-700 w-full sm:w-auto flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <select
                              className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-xs sm:text-sm"
                              value={productModalItemsPerPage}
                              onChange={(e) => {
                                setProductModalItemsPerPage(Number(e.target.value));
                                setProductModalCurrentPage(1);
                              }}
                            >
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                              <option value="75">75</option>
                              <option value="100">100</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setProductModalCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={productModalCurrentPage === 1}
                              className="px-3 py-1 text-xs border rounded-lg disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <span className="text-sm text-gray-700">
                              Page {productModalCurrentPage} of {totalProductPages}
                            </span>
                            <button
                              onClick={() => setProductModalCurrentPage((p) => Math.min(totalProductPages, p + 1))}
                              disabled={productModalCurrentPage === totalProductPages}
                              className="px-3 py-1 text-xs border rounded-lg disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                } else {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      No products found for this dealer
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {isProductModelModalOpen && (() => {
        const group = dealerModelGroups.find(g => g.model._id === activeProductModelId);
        if (!group) return null;

        const sortedProducts = [...group.items].sort((a, b) => {
          const serialA = a.product?.serialNumber || '';
          const serialB = b.product?.serialNumber || '';
          return getSerialCounter(serialB) - getSerialCounter(serialA);
        });

        return (
          <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-[60]">
            <div className="bg-white shadow-lg z-[70] w-full h-full flex flex-col overflow-y-auto">
              <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {group.model.name} - Individual Products ({group.count})
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <TableExportButtons
                    exportName={`Dealer_Products_${group.model.name}`}
                    exportData={sortedProducts.map(assignment => {
                      const prod = assignment.product || {};
                      return {
                        'Serial Number': prod.serialNumber || '-',
                        'Status': prod.sold ? 'Sold' : 'Available'
                      };
                    })}
                  />
                  <button
                    onClick={() => setIsProductModelModalOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-auto">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Serial
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedProducts.map((assignment) => {
                        const prod = assignment.product || {};
                        const isSold = prod.sold;
                        return (
                          <tr key={prod._id || assignment._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {prod.serialNumber || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${isSold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                              >
                                {isSold ? 'Sold' : 'Available'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function DistributorDealersWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <DistributorDealers />
    </ErrorBoundary>
  );
}
