import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, Box, CheckSquare, Square, Trash, Shield, User, Phone, FilePenLine, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function Executives() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data for assignments
  const [distributors, setDistributors] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  
  // Locations states
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form details (matching Distributor structure exactly)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    isActive: true,
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
  });

  // Multiple Distributor Assignment Cards
  const [assignments, setAssignments] = useState([
    { distributorId: '', dealerIds: [], subDealerIds: [] }
  ]);

  // Search terms for multi-selects (keyed by card index)
  const [dealerSearch, setDealerSearch] = useState({});
  const [subDealerSearch, setSubDealerSearch] = useState({});

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [execsRes, distsRes, dealersRes, subDealersRes] = await Promise.all([
        axios.get(`${API_URL}/executives`),
        axios.get(`${API_URL}/distributors`),
        axios.get(`${API_URL}/dealers`),
        axios.get(`${API_URL}/sub-dealers`),
      ]);
      setExecutives(execsRes.data);
      setDistributors(distsRes.data);
      setDealers(dealersRes.data);
      setSubDealers(subDealersRes.data);
    } catch (error) {
      toast.error('Failed to load data. Make sure you are logged in as admin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Fetch States
    const fetchStates = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations/states`);
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
      const response = await axios.get(`${API_URL}/locations/districts/${state}`);
      setCities(response.data);
      setLocations([]);
    } catch (error) {
      console.error(`Error fetching districts for ${state}:`, error);
    }
  };

  const fetchLocations = async (state, district) => {
    if (!state || !district) return;
    try {
      const response = await axios.get(`${API_URL}/locations/locations/${state}/${district}`);
      setLocations(response.data);
    } catch (error) {
      console.error(`Error fetching locations for ${state} - ${district}:`, error);
    }
  };

  // Fetch districts when state changes
  const handleStateChange = (state) => {
    setFormData(prev => ({
      ...prev,
      state,
      district: '',
      location: '',
      pincode: '',
    }));
    fetchDistricts(state);
  };

  // Fetch locations when district changes
  const handleDistrictChange = (state, district) => {
    setFormData(prev => ({
      ...prev,
      district,
      location: '',
      pincode: '',
    }));
    fetchLocations(state, district);
  };

  const handleLocationChange = (locationName) => {
    const selectedLoc = locations.find(loc => loc.location === locationName);
    if (selectedLoc) {
      setFormData(prev => ({
        ...prev,
        location: selectedLoc.location,
        pincode: selectedLoc.pincode,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: locationName,
        pincode: '',
      }));
    }
  };

  const handlePhoneChange = (value) => {
    const numericOnly = value.replace(/[^0-9]/g, '');
    if (value !== numericOnly && value.length > 0) {
      setPhoneError('Phone number must contain only numbers');
    } else if (numericOnly.length > 0 && numericOnly.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
    setFormData(prev => ({ ...prev, contactPhone: numericOnly }));
  };

  // Re-style form opens
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '',
      username: '',
      password: '',
      isActive: true,
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
    });
    setAssignments([{ distributorId: '', dealerIds: [], subDealerIds: [] }]);
    setDealerSearch({});
    setSubDealerSearch({});
    setPhoneError('');
    setIsEditing(false);
    setShowModal(true);
  };

  // Reconstruct card assignments on edit
  const handleOpenEdit = async (exec) => {
    setSelectedExecutive(exec);
    
    // Map object IDs to strings for inputs
    const distIds = exec.distributors.map(d => d._id || d);
    const dealerIds = exec.dealers.map(d => d._id || d);
    const subDealerIds = exec.subDealers.map(sd => sd._id || sd);

    // Reconstruct list of assignment cards
    const initialAssignments = distIds.map(distId => {
      const cardDealers = dealerIds.filter(dId => {
        const dealerObj = dealers.find(d => d._id === dId);
        if (!dealerObj) return false;
        const parentDistId = typeof dealerObj.distributor === 'object' && dealerObj.distributor !== null 
          ? dealerObj.distributor._id 
          : dealerObj.distributor;
        return parentDistId === distId;
      });

      const cardSubDealers = subDealerIds.filter(sdId => {
        const sdObj = subDealers.find(sd => sd._id === sdId);
        if (!sdObj) return false;
        const parentDealerId = typeof sdObj.dealer === 'object' && sdObj.dealer !== null 
          ? sdObj.dealer._id 
          : sdObj.dealer;
        return cardDealers.includes(parentDealerId);
      });

      return {
        distributorId: distId,
        dealerIds: cardDealers,
        subDealerIds: cardSubDealers
      };
    });

    setAssignments(initialAssignments.length > 0 ? initialAssignments : [{ distributorId: '', dealerIds: [], subDealerIds: [] }]);
    setDealerSearch({});
    setSubDealerSearch({});
    setPhoneError('');

    // Pre-populate location dropdowns
    if (exec.state) {
      await fetchDistricts(exec.state);
      if (exec.district) {
        await fetchLocations(exec.state, exec.district);
      }
    }

    setFormData({
      name: exec.name,
      phone: exec.phone,
      username: exec.username,
      password: '',
      isActive: exec.isActive,
      state: exec.state || '',
      district: exec.district || '',
      location: exec.location || '',
      addressLine1: exec.addressLine1 || '',
      addressLine2: exec.addressLine2 || '',
      pincode: exec.pincode || '',
      gstNumber: exec.gstNumber || '',
      contactPerson: exec.contactPerson || '',
      contactPhone: exec.contactPhone || '',
      email: exec.email || '',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Assignment Cards controls
  const addAssignmentCard = () => {
    setAssignments([...assignments, { distributorId: '', dealerIds: [], subDealerIds: [] }]);
  };

  const removeAssignmentCard = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
    const newDealerSearch = { ...dealerSearch };
    const newSubDealerSearch = { ...subDealerSearch };
    delete newDealerSearch[index];
    delete newSubDealerSearch[index];
    setDealerSearch(newDealerSearch);
    setSubDealerSearch(newSubDealerSearch);
  };

  const handleCardDistributorChange = (index, distId) => {
    const updated = [...assignments];
    updated[index] = {
      distributorId: distId,
      dealerIds: [],
      subDealerIds: []
    };
    setAssignments(updated);
  };

  const handleCardDealerChange = (index, dId) => {
    const card = assignments[index];
    const isSelected = card.dealerIds.includes(dId);
    let newDealers = [];
    if (isSelected) {
      newDealers = card.dealerIds.filter(id => id !== dId);
    } else {
      newDealers = [...card.dealerIds, dId];
    }
    
    const newSubDealers = card.subDealerIds.filter(sdId => {
      const sdObj = subDealers.find(sd => sd._id === sdId);
      if (!sdObj) return false;
      const parentDealerId = typeof sdObj.dealer === 'object' && sdObj.dealer !== null 
        ? sdObj.dealer._id 
        : sdObj.dealer;
      return newDealers.includes(parentDealerId);
    });

    const updated = [...assignments];
    updated[index] = {
      ...card,
      dealerIds: newDealers,
      subDealerIds: newSubDealers
    };
    setAssignments(updated);
  };

  const handleCardSubDealerChange = (index, sdId) => {
    const card = assignments[index];
    const isSelected = card.subDealerIds.includes(sdId);
    let newSubDealers = [];
    if (isSelected) {
      newSubDealers = card.subDealerIds.filter(id => id !== sdId);
    } else {
      newSubDealers = [...card.subDealerIds, sdId];
    }
    
    const updated = [...assignments];
    updated[index] = {
      ...card,
      subDealerIds: newSubDealers
    };
    setAssignments(updated);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this executive? This will also delete their login account.')) {
      try {
        await axios.delete(`${API_URL}/executives/${id}`);
        toast.success('Executive deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting executive');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error('Password is required for new executives');
      return;
    }
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    setIsSubmitting(true);

    // Flatten assignments to send to the backend
    const flatDists = [...new Set(assignments.map(a => a.distributorId).filter(Boolean))];
    const flatDealers = [...new Set(assignments.flatMap(a => a.dealerIds))];
    const flatSubDealers = [...new Set(assignments.flatMap(a => a.subDealerIds))];

    const payload = {
      ...formData,
      distributors: flatDists,
      dealers: flatDealers,
      subDealers: flatSubDealers,
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/executives/${selectedExecutive._id}`, payload);
        toast.success('Executive updated successfully');
      } else {
        await axios.post(`${API_URL}/executives`, payload);
        toast.success('Executive created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving executive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (exec) => {
    try {
      const updatedStatus = !exec.isActive;
      await axios.put(`${API_URL}/executives/${exec._id}`, {
        isActive: updatedStatus,
      });
      toast.success(`Executive ${updatedStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredExecutives = useMemo(() => {
    return executives.filter(exec => 
      exec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exec.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exec.phone.includes(searchTerm)
    );
  }, [executives, searchTerm]);

  return (
    <div className="p-2">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Executive List
              </h2>
              <p className="text-sm text-gray-600">
                Total {executives.length}
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Executive</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search executives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <TableExportButtons
            exportName="Executives_List"
            exportData={filteredExecutives.map(e => ({
              'Name': e.name,
              'Phone': e.phone,
              'Username': e.username,
              'Status': e.isActive ? 'Active' : 'Inactive',
              'Assigned Distributors': e.distributors.map(d => d.name).join(', '),
              'Assigned Dealers': e.dealers.map(d => d.name).join(', '),
              'Assigned Sub Dealers': e.subDealers.map(sd => sd.name).join(', ')
            }))}
          />
        </div>

        {/* Executives Table */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d55f5] mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading executives...</p>
            </div>
          ) : filteredExecutives.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No executives found
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Assigned Distributors</th>
                    <th className="px-6 py-3">Assigned Dealers</th>
                    <th className="px-6 py-3">Assigned Sub Dealers</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredExecutives.map((exec) => (
                    <tr key={exec._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-semibold">{exec.name}</div>
                            <div className="text-xs text-gray-400">@{exec.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {exec.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold border border-blue-200">
                          {exec.distributors?.length || 0} Distributors
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded text-xs font-semibold border border-yellow-200">
                          {exec.dealers?.length || 0} Dealers
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded text-xs font-semibold border border-teal-200">
                          {exec.subDealers?.length || 0} Sub Dealers
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(exec)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            exec.isActive
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {exec.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(exec)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <FilePenLine size={18} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(exec._id)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Centered Modal - styled exactly like DistributorModal.jsx */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-20 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-4 w-full max-w-md lg:max-w-5xl max-h-[95vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Executive Profile' : 'Add New Executive'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                    placeholder="Enter executive name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(formData.state, e.target.value)}
                    disabled={!formData.state}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white disabled:bg-gray-50"
                  >
                    <option value="">Select District</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    disabled={!formData.district}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white disabled:bg-gray-50"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.location} value={loc.location}>{loc.location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flat/House No./Building Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Flat/House No./Building Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Name/Landmark</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter Street Name/Landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.pincode}
                    placeholder="Pincode (auto)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter GST Number"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone No. (Contact) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter Phone No."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                      phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#4d55f5]'
                    }`}
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <span>✕</span> {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Executive Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter executive phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent disabled:bg-gray-100 bg-white"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {isEditing ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    required
                    value={formData.isActive ? 'Active' : 'Inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'Active' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* Hierarchy Assignment block */}
              <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Hierarchy Assignments</h3>
                    <p className="text-xs text-gray-500 mt-1">Configure independent distributor hierarchies for this Executive.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAssignmentCard}
                    className="flex items-center gap-1.5 bg-[#4d55f5] hover:bg-[#3b43db] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Distributor
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-4">
                  {assignments.map((card, index) => {
                    const cardDealersOptions = dealers.filter(d => {
                      const dDistId = typeof d.distributor === 'object' && d.distributor !== null 
                        ? d.distributor._id 
                        : d.distributor;
                      return dDistId === card.distributorId;
                    });

                    const cardSubDealersOptions = subDealers.filter(sd => {
                      const sdDealerId = typeof sd.dealer === 'object' && sd.dealer !== null 
                        ? sd.dealer._id 
                        : sd.dealer;
                      return card.dealerIds.includes(sdDealerId);
                    });

                    const curDealerSearch = dealerSearch[index] || '';
                    const curSubDealerSearch = subDealerSearch[index] || '';

                    const searchedCardDealers = cardDealersOptions.filter(d => 
                      d.name.toLowerCase().includes(curDealerSearch.toLowerCase())
                    );

                    const searchedCardSubDealers = cardSubDealersOptions.filter(sd => 
                      sd.name.toLowerCase().includes(curSubDealerSearch.toLowerCase())
                    );

                    return (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm relative hover:border-gray-300 transition-colors">
                        
                        {/* Card Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <span className="text-xs font-extrabold text-[#4d55f5] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md">
                            Distributor Hierarchy #{index + 1}
                          </span>
                          {assignments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAssignmentCard(index)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                              title="Remove Hierarchy Card"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Card Layout Rows */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          
                          {/* 1. Distributor Single Select */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Distributor *</label>
                            <select
                              required
                              value={card.distributorId}
                              onChange={(e) => handleCardDistributorChange(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d55f5] text-sm bg-white"
                            >
                              <option value="">Select Distributor</option>
                              {distributors.map(d => (
                                <option key={d._id} value={d._id}>{d.name} ({d.city || 'No City'})</option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Dealers Searchable Multi-select */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Dealers ({card.dealerIds.length} Selected)</label>
                            <input
                              type="text"
                              placeholder="Search Dealers..."
                              disabled={!card.distributorId}
                              value={curDealerSearch}
                              onChange={(e) => setDealerSearch({ ...dealerSearch, [index]: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4d55f5]"
                            />
                            <div className="max-h-36 overflow-y-auto border border-gray-150 rounded-lg p-2 space-y-1 bg-gray-50/50">
                              {!card.distributorId ? (
                                <div className="text-[11px] text-gray-400 text-center py-4">Select a distributor first</div>
                              ) : searchedCardDealers.map(dealer => {
                                const isChecked = card.dealerIds.includes(dealer._id);
                                return (
                                  <div
                                    key={dealer._id}
                                    onClick={() => handleCardDealerChange(index, dealer._id)}
                                    className="flex items-center gap-2 p-1 rounded hover:bg-white cursor-pointer select-none text-xs"
                                  >
                                    {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-[#4d55f5]" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
                                    <span className="font-medium text-gray-700">{dealer.name}</span>
                                  </div>
                                );
                              })}
                              {card.distributorId && searchedCardDealers.length === 0 && (
                                <div className="text-[11px] text-gray-400 text-center py-2">No dealers found</div>
                              )}
                            </div>
                          </div>

                          {/* 3. Sub Dealers Searchable Multi-select */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Sub Dealers ({card.subDealerIds.length} Selected)</label>
                            <input
                              type="text"
                              placeholder="Search Sub Dealers..."
                              disabled={card.dealerIds.length === 0}
                              value={curSubDealerSearch}
                              onChange={(e) => setSubDealerSearch({ ...subDealerSearch, [index]: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4d55f5]"
                            />
                            <div className="max-h-36 overflow-y-auto border border-gray-150 rounded-lg p-2 space-y-1 bg-gray-50/50">
                              {card.dealerIds.length === 0 ? (
                                <div className="text-[11px] text-gray-400 text-center py-4">Select at least one dealer first</div>
                              ) : searchedCardSubDealers.map(sd => {
                                const isChecked = card.subDealerIds.includes(sd._id);
                                return (
                                  <div
                                    key={sd._id}
                                    onClick={() => handleCardSubDealerChange(index, sd._id)}
                                    className="flex items-center gap-2 p-1 rounded hover:bg-white cursor-pointer select-none text-xs"
                                  >
                                    {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-[#4d55f5]" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
                                    <span className="font-medium text-gray-700">{sd.name}</span>
                                  </div>
                                );
                              })}
                              {card.dealerIds.length > 0 && searchedCardSubDealers.length === 0 && (
                                <div className="text-[11px] text-gray-400 text-center py-2">No sub dealers found</div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button Block - matching DistributorModal.jsx style exactly */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : isEditing ? (
                    'Update Executive'
                  ) : (
                    'Add Executive'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
