import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, Gift, IndianRupee, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PendingActionsCard() {
  const [actions, setActions] = useState({
    replacementRequests: 0,
    incentiveApprovals: 0,
    payoutsToProcess: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingActions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/pending-actions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActions(res.data);
      } catch (err) {
        console.error('Error fetching pending actions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingActions();
  }, []);

  const items = [
    {
      title: 'Replacement Requests',
      count: actions.replacementRequests,
      icon: <RefreshCw className="w-4 h-4 text-rose-500" />,
      bg: 'bg-rose-50',
      border: 'hover:border-rose-200',
      path: '/replacements',
      label: 'awaiting verification',
    },
    {
      title: 'Incentive Approvals',
      count: actions.incentiveApprovals,
      icon: <Gift className="w-4 h-4 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'hover:border-amber-200',
      path: '/incentives',
      label: 'awaiting approval',
    },
    {
      title: 'Payouts to Process',
      count: actions.payoutsToProcess,
      icon: <IndianRupee className="w-4 h-4 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'hover:border-blue-200',
      path: '/payouts',
      label: 'pending payout execution',
    },
    {
      title: 'Low Stock Items',
      count: actions.lowStockItems,
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      bg: 'bg-orange-50',
      border: 'hover:border-orange-200',
      path: '/inventory',
      label: 'below threshold',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Pending Actions</h3>
          <p className="text-xs text-gray-400">Action items requiring administrative attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((it, idx) => (
          <Link
            to={it.path}
            key={idx}
            className={`group p-3.5 rounded-xl border border-gray-100 ${it.border} bg-gray-50/40 hover:bg-white hover:shadow-xs transition-all flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${it.bg}`}>
                {it.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{it.title}</p>
                <p className="text-[11px] text-gray-400 font-medium">{it.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-8 rounded-sm"></div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {it.count}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
