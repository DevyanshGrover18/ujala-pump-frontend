import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import {
  Wrench,
  Wallet,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function PlumberDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalInstalled: 0,
    walletBalance: 0,
    pendingIncentives: 0,
  });
  const [recentInstallations, setRecentInstallations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch installations
        const instRes = await axios.get(`${API}/api/installations`, { headers });
        const installations = instRes.data;

        // Fetch incentive claims to calculate wallet balances
        const walletRes = await axios.get(`${API}/api/incentives/my/claims`, { headers });
        const walletData = walletRes.data;

        const approvedVal = walletData.wallet?.incentive || 0;
        
        // Calculate pending incentives from claims
        let pendingVal = 0;
        if (Array.isArray(walletData.claims)) {
          pendingVal = walletData.claims
            .filter((c) => c.status === 'Approval Pending')
            .reduce((sum, c) => sum + (c.totalIncentive || 0), 0);
        }

        setStats({
          totalInstalled: installations.length,
          walletBalance: approvedVal,
          pendingIncentives: pendingVal,
        });

        setRecentInstallations(installations.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardData = [
    {
      title: 'Total Installations',
      count: stats.totalInstalled,
      icon: <Wrench className="w-5 h-5" />,
      bg: '#EF4444', // Red
      path: '/plumber/installation',
    },
    {
      title: 'Wallet Balance',
      count: `₹${stats.walletBalance.toLocaleString('en-IN')}`,
      icon: <Wallet className="w-5 h-5" />,
      bg: '#10B981', // Green
      path: '/plumber/wallet',
    },
    {
      title: 'Pending Incentives',
      count: `₹${stats.pendingIncentives.toLocaleString('en-IN')}`,
      icon: <Clock className="w-5 h-5" />,
      bg: '#FB923C', // Orange
      path: '/plumber/wallet',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b189b]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user?.plumber?.name || user?.username || 'Plumber'}!</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is your motor installation dashboard.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cardData.map((card, index) => (
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

      {/* Recent Installations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Installations</h2>
            <p className="text-xs text-gray-500">Your latest motor registration activities</p>
          </div>
          <Link
            to="/plumber/installation"
            className="text-[#5b189b] hover:text-[#431075] text-sm font-semibold flex items-center gap-1 group"
          >
            New Installation{' '}
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentInstallations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No installations registered yet.</p>
            <p className="text-xs mt-1">Go to the Installation Tracker page to install your first motor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3">Serial Number</th>
                  <th className="py-3">Model Name</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {recentInstallations.map((inst) => (
                  <tr key={inst._id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-mono font-bold text-gray-900">{inst.serialNumber}</td>
                    <td className="py-4">{inst.model?.name || 'N/A'}</td>
                    <td className="py-4 flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(inst.installationDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#5b189b]" />
                        {inst.geolocation?.latitude?.toFixed(4)}, {inst.geolocation?.longitude?.toFixed(4)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
