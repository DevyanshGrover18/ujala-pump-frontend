import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { memberService } from './api';
import { AuthContext } from '../../../context/AuthContext';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import PermissionEditor from './PermissionEditor';
import TableExportButtons from '../../global/TableExportButtons';

export default function MembersList() {
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useContext(AuthContext);
  const [expandedMember, setExpandedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await memberService.getMembers();
      const members = Array.isArray(response)
        ? response
        : response.members || [];
      setMembersList(members);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch members');
      setMembersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDeleteMember = async (memberId) => {
    if (
      window.confirm('Are you sure you want to permanently delete this member?')
    ) {
      try {
        await memberService.deleteMember(memberId);
        toast.success('Member deleted successfully');
        fetchMembers(); // Refetch members to update the list
      } catch (error) {
        toast.error(error.message || 'Failed to delete member');
      }
    }
  };

  const handleTableAccessControlChange = async (
    memberId,
    section,
    permission
  ) => {
    try {
      const memberIndex = membersList.findIndex((m) => m._id === memberId);
      const member = membersList[memberIndex];
      const newAccessControl = { ...member.accessControl };

      // Ensure the section exists with default permissions if it's new/undefined
      if (!newAccessControl[section]) {
        newAccessControl[section] = {
          add: false,
          modify: false,
          delete: false,
          full: false,
        };
      }

      if (section === 'sales' || section === 'products') {
        // For sales and products, only 'full' (view) permission is relevant
        newAccessControl[section] = {
          add: false,
          modify: false,
          delete: false,
          full:
            permission === 'full'
              ? !newAccessControl[section].full
              : newAccessControl[section].full,
        };
      } else if (permission === 'full') {
        const isFull = !newAccessControl[section].full;
        newAccessControl[section] = {
          add: isFull,
          modify: isFull,
          delete: isFull,
          full: isFull,
        };
      } else {
        newAccessControl[section] = {
          ...newAccessControl[section],
          [permission]: !newAccessControl[section][permission],
          full: false,
        };
      }

      await memberService.updateMemberPrivileges(member._id, {
        accessControl: newAccessControl,
      });

      setMembersList((prevList) => {
        const newList = [...prevList];
        newList[memberIndex] = {
          ...member,
          accessControl: newAccessControl,
        };
        return newList;
      });

      toast.success('Privileges updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update privileges');
    }
  };

  const sections = [
    'management',
    'factories',
    'orders',
    'products',
    'distributors',
    'dealers',
    'sales',
    'subDealers',
  ];

  return (
    <div className="mt-10 bg-white shadow-lg rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Existing Members</h2>
        <TableExportButtons exportName="Members_List" />
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading members...</p>
      ) : membersList.length === 0 ? (
        <p className="text-gray-600">No members added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {membersList.map((member) => (
                <React.Fragment key={member._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            setExpandedMember(
                              expandedMember === member._id ? null : member._id
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {expandedMember === member._id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMember(member._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedMember === member._id && (
                    <tr>
                      <td colSpan="3">
                        <PermissionEditor
                          accessControl={member.accessControl}
                          sections={sections}
                          handleAccessControlChange={(section, permission) =>
                            handleTableAccessControlChange(
                              member._id,
                              section,
                              permission
                            )
                          }
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
