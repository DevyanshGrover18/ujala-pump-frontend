import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FilePenLine, Trash2, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AccountsMemberModal from './components/AccountsMemberModal';

const API_URL = `${import.meta.env.VITE_API_URL}/api/accounts`;
const LOCATION_URL = `${import.meta.env.VITE_API_URL}/api/locations`;

const emptyMember = {
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
  username: '',
  password: '',
  status: 'Active',
};

function Accounts() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyMember);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { headers });
      setMembers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load accounts members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch states
  const fetchStates = async () => {
    try {
      const res = await axios.get(`${LOCATION_URL}/states`);
      setStates(res.data);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const fetchDistricts = async (state) => {
    if (!state) return;
    try {
      const res = await axios.get(`${LOCATION_URL}/districts/${state}`);
      setCities(res.data);
      setLocations([]);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };

  const fetchLocations = async (state, district) => {
    if (!state || !district) return;
    try {
      const res = await axios.get(`${LOCATION_URL}/locations/${state}/${district}`);
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchStates();
  }, []);

  // Filtered + paginated
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.contactPerson?.toLowerCase().includes(term) ||
        m.state?.toLowerCase().includes(term) ||
        m.district?.toLowerCase().includes(term) ||
        m.accountsId?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const openAddModal = () => {
    setFormData(emptyMember);
    setCities([]);
    setLocations([]);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setFormData({ ...member, password: '' });
    if (member.state) fetchDistricts(member.state);
    if (member.state && member.district) fetchLocations(member.state, member.district);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleStateChange = (state) => {
    setFormData((prev) => ({ ...prev, state, district: '', location: '' }));
    fetchDistricts(state);
  };

  const handleDistrictChange = (state, district) => {
    setFormData((prev) => ({ ...prev, district, location: '' }));
    fetchLocations(state, district);
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`${API_URL}/${formData._id}`, payload, { headers });
        toast.success('Accounts member updated');
      } else {
        await axios.post(API_URL, formData, { headers });
        toast.success('Accounts member added successfully');
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accounts member? Their login access will also be removed.')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers });
      toast.success('Accounts member deleted');
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSelectAll = () => {
    const pageIds = paginated.map((m) => m._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : pageIds);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected accounts member(s)? Their login access will also be removed.`)) return;
    try {
      await axios.delete(API_URL, { headers, data: { ids: selectedIds } });
      toast.success('Selected accounts members deleted');
      setSelectedIds([]);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusToggle = async (member) => {
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.patch(`${API_URL}/${member._id}/status`, { status: newStatus }, { headers });
      toast.success(`Member set to ${newStatus}`);
      fetchMembers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Accounts Team
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage accounts team members who can view sales, incentives, and payouts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5b189b] hover:bg-[#4a1280] text-white font-bold rounded-xl shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search + Bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative max-w-sm flex-1 min-w-56">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, state..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-600">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#5b189b]" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#5b189b]" />
            <p className="text-sm font-bold text-gray-600">No accounts members found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first accounts team member to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((m) => selectedIds.includes(m._id))}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-[#5b189b] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Username</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {paginated.map((member) => (
                  <tr key={member._id} className={`hover:bg-gray-50/60 transition-colors ${selectedIds.includes(member._id) ? 'bg-purple-50/50' : ''}`}>
                    <td className="py-4 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(member._id)}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(member._id)
                              ? prev.filter((id) => id !== member._id)
                              : [...prev, member._id]
                          );
                        }}
                        className="w-4 h-4 accent-[#5b189b] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs font-bold text-purple-700">
                        {member.accountsId}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-gray-900 block">{member.name}</span>
                      <span className="text-xs text-gray-400">{member.email}</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-600">
                      <span className="block font-medium">{member.district}, {member.state}</span>
                      <span className="text-gray-400">{member.location}</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-600">
                      {member.contactPerson && <span className="block font-medium">{member.contactPerson}</span>}
                      {member.contactPhone && <span className="text-gray-400">{member.contactPhone}</span>}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs text-gray-700">{member.username}</span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleStatusToggle(member)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {member.status}
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FilePenLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing <span className="font-bold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span>–
              <span className="font-bold text-gray-700">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-bold text-gray-700">{filtered.length}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 font-medium"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AccountsMemberModal
        isOpen={showModal}
        isEditing={isEditing}
        member={formData}
        states={states}
        cities={cities}
        locations={locations}
        isSubmitting={isSubmitting}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
}

export default Accounts;
