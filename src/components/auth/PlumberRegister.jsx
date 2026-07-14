import { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/plumbers/register`;

export default function PlumberRegister({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    state: '',
    district: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    location: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

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

  const handleStateChange = async (state) => {
    setFormData((prev) => ({ ...prev, state, district: '' }));
    if (state) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/locations/districts/${state}`
        );
        setCities(response.data);
      } catch (error) {
        console.error(`Error fetching districts for ${state}:`, error);
      }
    } else {
      setCities([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await axios.post(API_URL, submitData);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Plumber registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-4 md:p-0">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Register as Plumber
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Create a new plumber account to start registering motor installations and tracking incentives.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
              Full Name *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="phone">
              Phone Number *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="state">
              State *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
              id="state"
              name="state"
              value={formData.state}
              onChange={(e) => handleStateChange(e.target.value)}
              required
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              disabled={!formData.state}
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
              Town/Location *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="location"
              name="location"
              type="text"
              placeholder="Enter town or local area"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="pincode">
              Pincode *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="pincode"
              name="pincode"
              type="text"
              placeholder="6-digit pincode"
              pattern="\d{6}"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="addressLine1">
              Address Line 1 *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="addressLine1"
              name="addressLine1"
              type="text"
              placeholder="Street name, house no., building details"
              value={formData.addressLine1}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="addressLine2">
              Address Line 2 (Optional)
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="addressLine2"
              name="addressLine2"
              type="text"
              placeholder="Apartment, suite, landmark, etc."
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
              Username *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Password *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirm Password *
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-shadow duration-200"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            className="w-full bg-[#06B6D4] hover:bg-[#0891b2] text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#06B6D4]">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your plumber account has been created successfully. You can now log in using your username and password.
            </p>
            <button
              onClick={onBack}
              className="w-full bg-[#06B6D4] hover:bg-[#0891b2] text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
