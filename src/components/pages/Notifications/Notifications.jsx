import { useState, useEffect, useContext } from 'react';
import { X, Eye, EyeOff, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';

export default function Notifications({ setTotalNotifications }) {
  const { user } = useContext(AuthContext);
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [distributorRequests, setDistributorRequests] = useState([]);
  const [dealerDeletionRequests, setDealerDeletionRequests] = useState([]);
  const [customerChangeRequests, setCustomerChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPasswordResetRequest, setSelectedPasswordResetRequest] =
    useState(null);
  const [selectedDistributorRequest, setSelectedDistributorRequest] =
    useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState(''); // New state for username
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const passwordCount = passwordResetRequests.length;
  const distributorCount = distributorRequests.length;
  const dealerDeletionCount = dealerDeletionRequests.length;
  const customerChangeCount = customerChangeRequests.length;
  const totalNotifications =
    passwordCount +
    distributorCount +
    dealerDeletionCount +
    customerChangeCount;

  const getConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [
        passwordResetRes,
        distributorReqRes,
        dealerDeletionReqRes,
        customerChangeReqRes,
      ] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/password-reset-requests`,
          getConfig()
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/distributor-requests/pending`,
          getConfig()
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/dealer-deletion-requests`,
          getConfig()
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/customer-change-requests/pending`,
          getConfig()
        ),
      ]);
      setPasswordResetRequests(passwordResetRes.data);
      setDistributorRequests(distributorReqRes.data);
      setDealerDeletionRequests(dealerDeletionReqRes.data);
      setCustomerChangeRequests(customerChangeReqRes.data);
      setTotalNotifications(
        passwordResetRes.data.length +
          distributorReqRes.data.length +
          dealerDeletionReqRes.data.length +
          customerChangeReqRes.data.length
      );
    } catch (error) {
      toast.error('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDistributorRequest = async (e, requestId) => {
    e.preventDefault();
    setApproveLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/distributor-requests/${requestId}/approve`,
        {
          username: newUsername,
          password: newPassword,
        },
        getConfig()
      );
      toast.success('Distributor request approved and distributor created!');
      setSelectedDistributorRequest(null);
      setNewUsername('');
      setNewPassword('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectDistributorRequest = async (requestId) => {
    if (
      window.confirm(
        'Are you sure you want to reject this distributor request?'
      )
    ) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/distributor-requests/${requestId}/reject`,
          {},
          getConfig()
        );
        toast.success('Distributor request rejected!');
        fetchRequests();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Rejection failed');
      }
    }
  };

  const handleDeclinePasswordReset = async (requestId) => {
    if (
      window.confirm(
        'Are you sure you want to decline this password reset request?'
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/auth/password-reset-requests/${requestId}`,
          getConfig()
        );
        toast.success('Password reset request declined');
        fetchRequests();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Decline failed');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          requestId: selectedPasswordResetRequest._id,
          newPassword,
        },
        getConfig()
      );
      toast.success('Password reset successfully!');
      setSelectedPasswordResetRequest(null);
      setNewPassword('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  const handleApproveDealerDeletion = (request) => {
    setRequestToDelete(request);
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDeleteDealer = async () => {
    if (!requestToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/dealer-deletion-requests/${requestToDelete._id}/approve`,
        getConfig()
      );
      toast.success('Dealer and deletion request approved and removed!');
      fetchRequests();
      setShowDeleteConfirmationModal(false);
      setRequestToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to approve deletion request'
      );
    }
  };

  const handleDeclineDealerDeletion = async (requestId) => {
    if (
      window.confirm(
        'Are you sure you want to decline this dealer deletion request?'
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/dealer-deletion-requests/${requestId}/decline`,
          getConfig()
        );
        toast.success('Dealer deletion request declined!');
        fetchRequests();
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to decline deletion request'
        );
      }
    }
  };

  const handleApproveCustomerChange = async (requestId, adminResponse = '') => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/customer-change-requests/${requestId}/approve`,
        {
          adminResponse,
        },
        getConfig()
      );
      toast.success('Customer change request approved!');
      fetchRequests();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to approve change request'
      );
    }
  };

  const handleRejectCustomerChange = async (
    requestId,
    adminResponse = 'Request rejected'
  ) => {
    if (
      window.confirm(
        'Are you sure you want to reject this customer change request?'
      )
    ) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/customer-change-requests/${requestId}/reject`,
          {
            adminResponse,
          },
          getConfig()
        );
        toast.success('Customer change request rejected!');
        fetchRequests();
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to reject change request'
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Manage all pending requests.</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('password')}
            className={`${activeTab === 'password' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <span>Password Reset Requests</span>
            {passwordCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {passwordCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('distributor')}
            className={`${activeTab === 'distributor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <span>New Distributor Requests</span>
            {distributorCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {distributorCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('dealerDeletion')}
            className={`${activeTab === 'dealerDeletion' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <span>Dealer Deletion Requests</span>
            {dealerDeletionCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {dealerDeletionCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('customerChange')}
            className={`${activeTab === 'customerChange' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <span>Customer Change Requests</span>
            {customerChangeCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {customerChangeCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'password' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Password Reset Requests
          </h2>
          {passwordResetRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-5 5-5-5h5v-12h5v12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending password reset requests
              </h3>
              <p className="text-gray-500">
                All password reset requests have been processed.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Entity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Requested
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {passwordResetRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 capitalize">
                          {request.role}
                        </td>
                        <td className="px-6 py-4">
                          {request.role === 'factory' && (
                            <div className="font-medium text-gray-900">
                              {request.factory?.name}
                            </div>
                          )}
                          {request.role === 'distributor' && (
                            <div className="font-medium text-gray-900">
                              {request.distributor?.name}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            {request.role === 'factory' &&
                              `Code: ${request.factory?.code}`}
                            {request.role === 'distributor' &&
                              `ID: ${request.distributor?._id}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {request.username}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {request.role === 'factory' &&
                            request.factory?.location}
                          {request.role === 'distributor' &&
                            request.distributor?.location}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(request.requestedAt).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(request.requestedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button
                            onClick={() =>
                              setSelectedPasswordResetRequest(request)
                            }
                            className="text-green-600 hover:text-green-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Approve Request"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeclinePasswordReset(request._id)
                            }
                            className="text-red-600 hover:text-red-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Decline Request"
                          >
                            <X className="w-5 h-5" />{' '}
                          </button>{' '}
                        </td>{' '}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'distributor' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            New Distributor Requests
          </h2>
          {distributorRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-5 5-5-5h5v-12h5v12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending distributor requests
              </h3>
              <p className="text-gray-500">
                All new distributor requests have been processed.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Requested
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {distributorRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">
                          {request.name}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {request.location}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(request.requestedAt).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(request.requestedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button
                            onClick={() =>
                              setSelectedDistributorRequest(request)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleRejectDistributorRequest(request._id)
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dealerDeletion' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dealer Deletion Requests
          </h2>
          {dealerDeletionRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-5 5-5-5h5v-12h5v12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending dealer deletion requests
              </h3>
              <p className="text-gray-500">
                All dealer deletion requests have been processed.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Dealer Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Distributor Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Requested At
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dealerDeletionRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">
                          {request.dealer?.name}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {request.distributor?.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(request.requestedAt).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(request.requestedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button
                            onClick={() => handleApproveDealerDeletion(request)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Approve Deletion"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeclineDealerDeletion(request._id)
                            }
                            className="text-red-600 hover:text-red-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Decline Deletion"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'customerChange' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Customer Change Requests
          </h2>
          {customerChangeRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-5 5-5-5h5v-12h5v12z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending customer change requests
              </h3>
              <p className="text-gray-500">
                All customer change requests have been processed.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Requested By
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Changes
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Requested
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customerChangeRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {request.requestedByName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {request.requestedByModel.toLowerCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {request.originalData.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.originalData.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            {Object.entries(request.requestedChanges).map(
                              ([key, value]) => {
                                const originalValue = request.originalData[key];
                                const fieldName = key
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim();
                                return (
                                  <div key={key} className="flex flex-col">
                                    <span className="font-medium capitalize">
                                      {fieldName}:
                                    </span>
                                    <div className="ml-2 text-xs">
                                      <span className="text-red-600">
                                        From: {originalValue || 'N/A'}
                                      </span>
                                      <br />
                                      <span className="text-green-600">
                                        To: {value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString()} at{' '}
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button
                            onClick={() =>
                              handleApproveCustomerChange(request._id)
                            }
                            className="text-green-600 hover:text-green-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Approve Changes"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleRejectCustomerChange(request._id)
                            }
                            className="text-red-600 hover:text-red-800 p-2 rounded-full border hover:bg-gray-100"
                            title="Reject Changes"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedPasswordResetRequest && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Password
              </h3>
              <button
                onClick={() => setSelectedPasswordResetRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Type:{' '}
                <span className="font-medium capitalize">
                  {selectedPasswordResetRequest.role}
                </span>
              </p>
              {selectedPasswordResetRequest.role === 'factory' && (
                <p className="text-sm text-gray-600">
                  Factory:{' '}
                  <span className="font-medium">
                    {selectedPasswordResetRequest.factory?.name}
                  </span>
                </p>
              )}
              {selectedPasswordResetRequest.role === 'distributor' && (
                <p className="text-sm text-gray-600">
                  Distributor:{' '}
                  <span className="font-medium">
                    {selectedPasswordResetRequest.distributor?.name}
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Username:{' '}
                <span className="font-medium">
                  {selectedPasswordResetRequest.username}
                </span>
              </p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPasswordResetRequest(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl disabled:opacity-50"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Distributor Request Modal */}
      {selectedDistributorRequest && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Approve Distributor Request
              </h3>
              <button
                onClick={() => {
                  setSelectedDistributorRequest(null);
                  setNewUsername('');
                  setNewPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Request from:{' '}
                <span className="font-medium">
                  {selectedDistributorRequest.name}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Email:{' '}
                <span className="font-medium">
                  {selectedDistributorRequest.email}
                </span>
              </p>
            </div>
            <form
              onSubmit={(e) =>
                handleApproveDistributorRequest(
                  e,
                  selectedDistributorRequest._id
                )
              }
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Username for Distributor
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password for Distributor
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistributorRequest(null);
                    setNewUsername('');
                    setNewPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl disabled:opacity-50"
                >
                  {approveLoading ? 'Approving...' : 'Approve Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dealer Deletion Confirmation Modal */}
      {showDeleteConfirmationModal && requestToDelete && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Dealer Deletion
              </h3>
              <button
                onClick={() => setShowDeleteConfirmationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the dealer{' '}
              <span className="font-medium">
                {requestToDelete.dealer?.name}
              </span>{' '}
              (requested by{' '}
              <span className="font-medium">
                {requestToDelete.distributor?.name}
              </span>
              )? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirmationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteDealer}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
