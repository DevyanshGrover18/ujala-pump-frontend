import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, Truck, Users, UserCog, Wrench, Shield } from 'lucide-react';

export default function PartnerSummaryCard() {
  const [counts, setCounts] = useState({
    executives: 0,
    distributors: 0,
    dealers: 0,
    subDealers: 0,
    plumbers: 0,
    staff: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/partner-summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCounts(res.data);
      } catch (err) {
        console.error('Error fetching partner summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const partners = [
    {
      title: 'Executives',
      count: counts.executives,
      icon: <UserCheck className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50',
      path: '/executives',
    },
    {
      title: 'Distributors',
      count: counts.distributors,
      icon: <Truck className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50',
      path: '/distributors',
    },
    {
      title: 'Dealers',
      count: counts.dealers,
      icon: <Users className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50',
      path: '/dealers',
    },
    {
      title: 'Sub-Dealers',
      count: counts.subDealers,
      icon: <UserCog className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50',
      path: '/sub-dealers',
    },
    {
      title: 'Plumbers',
      count: counts.plumbers,
      icon: <Wrench className="w-4 h-4 text-sky-600" />,
      bg: 'bg-sky-50',
      path: '/plumbers',
    },
    {
      title: 'Staff',
      count: counts.staff,
      icon: <Shield className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50',
      path: '/staff',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">User / Partner Summary</h3>
          <p className="text-xs text-gray-400">Registered network base & team</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {partners.map((p, idx) => (
          <Link
            to={p.path}
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all bg-gray-50/40 hover:bg-white"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.bg}`}>
              {p.icon}
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 line-clamp-1">{p.title}</p>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-5 w-8 rounded-sm my-0.5"></div>
              ) : (
                <p className="text-base font-bold text-gray-900">
                  {p.count?.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
