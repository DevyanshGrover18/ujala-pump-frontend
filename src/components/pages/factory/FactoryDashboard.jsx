import { useState, useEffect, useContext } from 'react';
import { ShoppingCart, Bell, Clock } from 'lucide-react'; // Changed TrendingUp to Clock icon
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { getNewOrdersCount } from '../FactoryManagement/services/factoryService'; // Import the new service

export default function FactoryDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    pendingOrders: 0,
    newOrders: 0,
  }); // Changed sales to pendingOrders
  const [loading, setLoading] = useState(true);
  const { user, refreshDashboardTrigger } = useContext(AuthContext); // Get user and refreshDashboardTrigger

  useEffect(() => {
    if (user?.factory?._id) {
      fetchStats();
    }
  }, [user, refreshDashboardTrigger]); // Added user and refreshDashboardTrigger to dependency array

  const fetchStats = async () => {
    try {
      setLoading(true);
      const factoryId = user.factory._id;

      const [ordersResponse, newOrdersCountResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/factories/${factoryId}/orders`
        ),
        getNewOrdersCount(factoryId), // Fetch new orders count
      ]);

      const orders = ordersResponse.data.length;
      const pendingOrders = ordersResponse.data.filter(
        (order) => order.status === 'Pending'
      ).length; // Calculate pending orders

      setStats({ orders, pendingOrders, newOrders: newOrdersCountResponse }); // Set pendingOrders
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {' '}
            {/* Changed to 3 columns */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Factory Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.factory?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {' '}
        {/* Changed to 3 columns */}
        <Link to="/factory/orders">
          <div
            className="rounded-xl shadow-card p-6 text-white transition-transform hover:scale-102"
            style={{ background: '#3B82F6' }}
          >
            <div className="flex items-start justify-between">
              <div>
                {stats.newOrders > 0 ? (
                  <>
                    <div className="relative bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                      <Bell className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      <div className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                        {stats.newOrders}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1 text-white/90">
                      Total Orders
                    </h3>
                    {loading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                    ) : (
                      <p className="text-2xl font-bold text-red-500">
                        {stats.newOrders} new{' '}
                        {stats.newOrders === 1 ? 'order' : 'orders'}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                      <ShoppingCart
                        className="w-5 h-3"
                        style={{ color: '#3B82F6' }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-1 text-white/90">
                      Total Orders
                    </h3>
                    <p className="text-2xl font-bold">&nbsp;</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
        <Link to="/factory/orders">
          {' '}
          {/* Link to factory orders page */}
          <div
            className="rounded-xl shadow-card p-6 text-white transition-transform hover:scale-102"
            style={{ background: '#FFA000' }}
          >
            {' '}
            {/* Changed color for Pending Orders */}
            <div className="flex items-start justify-between">
              <div>
                <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                  <Clock className="w-5 h-5" style={{ color: '#FFA000' }} />{' '}
                  {/* Clock icon for Pending Orders */}
                </div>
                <h3 className="text-sm font-semibold mb-1 text-white/90">
                  Pending Orders
                </h3>
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                ) : (
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
