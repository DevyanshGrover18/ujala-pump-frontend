import { useState, useEffect, useContext } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function NotificationIcon() {
  const { user } = useContext(AuthContext);
  const [count, setCount] = useState(0);

  const getConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
  };

  useEffect(() => {
    if (user && user.token) {
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchCount = async () => {
    try {
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
      const totalCount =
        passwordResetRes.data.length +
        distributorReqRes.data.length +
        dealerDeletionReqRes.data.length +
        customerChangeReqRes.data.length;
      console.log('Notification counts:', {
        password: passwordResetRes.data.length,
        distributor: distributorReqRes.data.length,
        dealerDeletion: dealerDeletionReqRes.data.length,
        customerChange: customerChangeReqRes.data.length,
        total: totalCount,
      });
      setCount(totalCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setCount(0);
    }
  };

  return (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
}
