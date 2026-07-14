import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, FilePenLine, Trash2, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/plumbers`;

export default function Plumbers() {
  const [plumbers, setPlumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlumber, setSelectedPlumber] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States & districts for address drop-down
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    district: '',
    location: '',
    pincode: '',
    username: '',
    password: '',
    status: 'Active',
  });

  const fetchPlumbers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlumbers(response.data);
    } catch (error) {
      console.error('Error fetching plumbers:', error);
      toast.error('Failed to load plumbers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlumbers();
    
    // Fetch States
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

  const handleStateChange = async (stateVal) => {
    setFormData((prev) => ({ ...prev, state: stateVal, district: '' }));
    if (stateVal) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/locations/districts/${stateVal}`
        );
        setCities(response.data);
      } catch (error) {
        console.error(`Error fetching districts for ${stateVal}:`, error);
      }
    } else {
      setCities([]);
    }
  };

  const handleOpenAdd = () => {
    setSelectedPlumber(null);
    setIsEditing(false);
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      district: '',
      location: '',
      pincode: '',
      username: '',
      password: '',
      status: 'Active',
    });
    setCities([]);
    setShowModal(true);
  };

  const handleOpenEdit = async (plumber) => {
    setSelectedPlumber(plumber);
    setIsEditing(true);
    setFormData({
      name: plumber.name || '',
      phone: plumber.phone || '',
      addressLine1: plumber.addressLine1 || '',
      addressLine2: plumber.addressLine2 || '',
      state: plumber.state || '',
      district: plumber.district || '',
      location: plumber.location || '',
      pincode: plumber.pincode || '',
      username: plumber.username || '',
      password: '',
      status: plumber.status || 'Active',
    });

    if (plumber.state) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/locations/cities/${plumber.state}`
        );
        setCities(response.data);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    } else {
      setCities([]);
    }

    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && (!formData.password || formData.password.length < 8)) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        // Edit plumber
        await axios.put(`${API_URL}/${selectedPlumber._id}`, formData, { headers });
        toast.success('Plumber details updated successfully.');
      } else {
        // Add plumber
        await axios.post(API_URL, formData, { headers });
        toast.success('Plumber created successfully.');
      }

      setShowModal(false);
      fetchPlumbers();
    } catch (error) {
      console.error('Error saving plumber:', error);
      toast.error(error.response?.data?.message || 'Failed to save plumber.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (plumber) => {
    const confirm = window.confirm(`Are you sure you want to deactivate ${plumber.name}?`);
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${plumber._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Plumber deactivated successfully.');
      fetchPlumbers();
    } catch (error) {
      console.error('Error deleting plumber:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate plumber.');
    }
  };

  // Filter plumbers by search
  const filteredPlumbers = useMemo(() => {
    if (!searchTerm.trim()) return plumbers;
    const term = searchTerm.toLowerCase();
    return plumbers.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.plumberId?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.state?.toLowerCase().includes(term) ||
        p.district?.toLowerCase().includes(term)
    );
  }, [plumbers, searchTerm]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plumber Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add, update, and manage plumbers who register motor installations.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#4d55f5] hover:bg-[#3d45e5] text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm text-sm"
        >
          <Plus className="w-5 h-5" /> Add New Plumber
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Plumbers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredPlumbers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">No plumbers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-4 px-6">Plumber ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact details</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-right">Wallet incentive</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredPlumbers.map((plumber) => (
                  <tr key={plumber._id} className="hover:bg-gray-50/30">
                    <td className="py-4 px-6 font-mono font-bold text-cyan-600">
                      {plumber.plumberId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{plumber.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">@{plumber.username}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700">{plumber.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-700 font-medium">
                        {plumber.location || 'N/A'}, {plumber.district || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {plumber.state || 'N/A'} - {plumber.pincode || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                      ₹{(plumber.walletIncentive || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          plumber.status === 'Active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {plumber.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(plumber)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit Details"
                        >
                          <FilePenLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plumber)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Deactivate Plumber"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Plumber Details' : 'Add New Plumber'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="state">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  >
                    <option value="">Select State</option>
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="district">
                    District *
                  </label>
                  <select
                    id="district"
                    name="district"
                    required
                    disabled={!formData.state}
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  >
                    <option value="">Select District</option>
                    {cities.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="location">
                    Location/Town *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="pincode">
                    Pincode *
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    required
                    pattern="\d{6}"
                    placeholder="6 digits"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="addressLine1">
                    Address Line 1 *
                  </label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="addressLine2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
                    Username *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
                    Password {isEditing && '(Leave blank to keep current)'}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={isEditing ? '••••••••' : 'Minimum 8 characters'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="status">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-grow px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-grow bg-[#4d55f5] hover:bg-[#3d45e5] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Plumber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
