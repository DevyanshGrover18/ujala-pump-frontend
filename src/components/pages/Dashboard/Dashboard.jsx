import { useState, useEffect, useContext } from 'react';
import { Building, ShoppingCart, Package, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OrderItemsPieChart from './OrderItemsPieChart';
import SalesHistogram from './SalesHistogram';
import { AuthContext } from '../../../context/AuthContext';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { isAdmin, hasPrivilege } = useContext(AuthContext);

  const [counts, setCounts] = useState({
    factories: 0,
    orders: 0,
    products: 0,
    dealers: 0,
    distributors: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    dispatched: 0,
  });

  const cardPathToSection = {
    '/factory-management': 'factories',
    '/management': 'management', // Assuming Models fall under 'management'
    '/distributors': 'distributors',
    '/dealers': 'dealers',
    '/orders': 'orders',
    // Add other mappings as needed for any future cards
  };

  const canAccessCard = (path) => {
    if (isAdmin) return true; // Superadmin can see everything

    const section = cardPathToSection[path];
    if (!section) return false; // If a card's path isn't mapped, hide it by default for non-admins

    return (
      hasPrivilege(section, 'full') ||
      hasPrivilege(section, 'view') || // Assuming there might be a 'view' privilege
      hasPrivilege(section, 'add') ||
      hasPrivilege(section, 'modify') ||
      hasPrivilege(section, 'delete')
    );
  };

  // 2. Refactor useEffect to fetch all data and handle loading state correctly
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Use Promise.all to fetch from both endpoints concurrently
        const [countsResponse, statsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/counts`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`),
        ]);

        // Set state with the data from both responses
        setCounts(countsResponse.data);
        setOrderStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        // This ensures loading is set to false even if an error occurs
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const cardData = [
    {
      title: 'Total Factories',
      count: counts.factories,
      icon: <Building className="w-5 h-5" />,
      bg: '#7C3AED',
      path: '/factory-management',
    },
    {
      title: 'Total Models',
      count: counts.models,
      icon: <Package className="w-5 h-5" />,
      bg: '#EF4444',
      path: '/management',
    },
    {
      title: 'Total Distributors',
      count: counts.distributors,
      icon: <Truck className="w-5 h-5" />,
      bg: '#F59E0B',
      path: '/distributors',
    },
    {
      title: 'Total Dealers',
      count: counts.dealers,
      icon: <Users className="w-5 h-5" />,
      bg: '#FB923C',
      path: '/dealers',
    },
    {
      title: 'Total Orders',
      count: counts.orders,
      icon: <ShoppingCart className="w-5 h-5" />,
      bg: '#0EA5E9',
      path: '/orders',
    },
    // { title: 'Pending Orders', count: orderStats.pending, icon: <ShoppingCart className="w-5 h-5" />, bg: '#F59E0B', path: '/orders' },
    // { title: 'Completed Orders', count: orderStats.completed, icon: <ShoppingCart className="w-5 h-5" />, bg: '#10B981', path: '/orders' },
    // { title: 'Dispatched Orders', count: orderStats.dispatched, icon: <Truck className="w-5 h-5" />, bg: '#7C3AED', path: '/orders' },
  ];

  return (
    <div className="p-4">
      <div className="p-1 bg-white min-h-50 mt-3 rounded-xl">
        <div className="p-3 sm:p-6">
          <h1 className="mb-5 font-bold text-lg">Progress Overview</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-1">
            {cardData
              .filter((card) => canAccessCard(card.path)) // Filter cards based on permissions
              .map((card, index) => (
                <Link to={card.path} key={index}>
                  <div
                    className="rounded-xl shadow-card p-4 sm:p-6 text-white transition-transform hover:scale-102"
                    style={{ background: card.bg }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="bg-white p-2 rounded-md inline-flex items-center justify-center mb-3 shadow-sm">
                          <span style={{ color: card.bg }}>{card.icon}</span>
                        </div>
                        <h3 className="text-sm font-semibold mb-1 text-white/90">
                          {card.title}
                        </h3>
                        {loading ? (
                          <div className="animate-pulse bg-white/20 h-8 w-16 rounded-md"></div>
                        ) : (
                          <p className="text-2xl sm:text-2xl font-bold">
                            {card.count}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <div className="bg-white w-full rounded-xl p-5">
          <h1 className="mb-5 font-bold text-lg">Order Items Status</h1>
          <OrderItemsPieChart />
        </div>
        {/* <div className="bg-white lg:w-1/2 rounded-xl p-5">
                <h1 className="mb-5 font-bold text-lg">Monthly Sales Overview</h1>
                <SalesHistogram />
            </div> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* <div className="bg-white w-full rounded-xl p-5">
            <h1 className="mb-5 font-bold text-lg">Order Status Overview</h1>
            <ProductGraph />
        </div> */}
      </div>
    </div>
  );
}
