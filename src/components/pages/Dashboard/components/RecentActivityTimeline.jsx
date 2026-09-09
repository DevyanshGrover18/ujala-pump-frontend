import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, Gift, UserPlus, IndianRupee, Truck, Bell } from 'lucide-react';

export default function RecentActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/recent-activity?limit=6`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActivities(res.data);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'replacement':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
        );
      case 'claim':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
        );
      case 'dealer':
      case 'distributor':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'payout':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
        );
      case 'order':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
          <p className="text-xs text-gray-400">Live operational & admin updates</p>
        </div>
        <Link
          to="/notifications"
          className="text-xs font-semibold text-[#4d55f5] hover:text-[#3d45e5] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d55f5]"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-gray-400">
            No recent activity recorded
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              {getActivityIcon(act.type)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{act.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{act.description}</p>
              </div>
              <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap shrink-0">
                {getRelativeTime(act.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
