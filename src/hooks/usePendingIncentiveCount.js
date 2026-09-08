import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export function usePendingIncentiveCount() {
  const { user } = useContext(AuthContext);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    const role = user.role;
    if (role !== 'admin' && role !== 'accounts') return;

    try {
      const token = localStorage.getItem('token') || user.token;
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incentives/pending-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && typeof response.data.count === 'number') {
        setPendingCount(response.data.count);
      }
    } catch (err) {
      // Don't clutter console if request fails silently
    }
  }, [user]);

  useEffect(() => {
    fetchCount();

    const interval = setInterval(fetchCount, 20000); // Poll every 20s
    const handleUpdate = () => fetchCount();

    window.addEventListener('incentives-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('incentives-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchCount]);

  return { pendingCount, refreshPendingCount: fetchCount };
}
