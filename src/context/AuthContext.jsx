import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`; // Define base URL

// Create an axios instance with a request interceptor to attach the token
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshDashboardTrigger, setRefreshDashboardTrigger] = useState(0); // New state for triggering dashboard refresh

  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Function to refresh user data from the backend
  const refreshUser = async () => {
    try {
      const response = await authAxios.get('/auth/me'); // Assuming an endpoint /api/auth/me
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, consider logging out the user
      logout();
      return null;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    // Also store token separately for convenience
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const triggerDashboardRefresh = () => {
    setRefreshDashboardTrigger((prev) => prev + 1);
  }; // Function to trigger refresh

  const isAuthenticated = Boolean(user);
  const isAdmin = isAuthenticated && user.role === 'admin';
  const isFactoryAuthenticated = isAuthenticated && user.role === 'factory';
  const isDistributorAuthenticated =
    isAuthenticated && user.role === 'distributor';
  const isDealerAuthenticated = isAuthenticated && user.role === 'dealer';
  const isSubDealerAuthenticated = isAuthenticated && user.role === 'subdealer';
  const isExecutiveAuthenticated = isAuthenticated && user.role === 'executive';

  // Session timeout useEffect
  useEffect(() => {
    let timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          logout();
        },
        6 * 60 * 60 * 1000
      ); // 6 hours
    };

    if (isAuthenticated) {
      resetTimeout();
      window.addEventListener('mousemove', resetTimeout);
      window.addEventListener('keypress', resetTimeout);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [isAuthenticated, logout]);

  const _privs = user?.privileges || user?.accessControl || null;
  const hasPrivilege = (section, privilege) => {
    if (!user || !_privs) return false;
    // The _privs[section] might be undefined for newly added sections for existing users
    if (!_privs[section]) {
      return false;
    }
    return _privs[section]?.[privilege] || _privs[section]?.full || false;
  };

  const hasAnyPrivilege = (section) => {
    if (!user || !_privs) return false;
    const perms = _privs[section];
    if (!perms) return false;
    return Boolean(perms.full || perms.add || perms.modify || perms.delete);
  };

  const hasFullManagementAccess = () => {
    // Admins always have full management access
    if (isAdmin) return true;
    if (!_privs) return false;
    return _privs.management?.full === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isFactoryAuthenticated,
        isDistributorAuthenticated,
        isDealerAuthenticated,
        isSubDealerAuthenticated,
        isExecutiveAuthenticated,
        login,
        logout,
        loading,
        refreshDashboardTrigger,
        triggerDashboardRefresh,
        hasPrivilege,
        hasAnyPrivilege,
        hasFullManagementAccess,
        refreshUser, // Expose refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
