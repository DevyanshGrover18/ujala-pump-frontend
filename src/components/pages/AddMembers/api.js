import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const memberService = {
  createMember: async (memberData) => {
    try {
      const response = await axios.post(`${BASE_URL}/users`, memberData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create member' };
    }
  },

  getMembers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch members' };
    }
  },

  updateMemberPrivileges: async (memberId, data) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${memberId}`, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: 'Failed to update member privileges',
        }
      );
    }
  },

  deleteMember: async (memberId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/users/${memberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete member' };
    }
  },
};
