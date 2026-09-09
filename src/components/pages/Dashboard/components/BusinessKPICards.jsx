import React from 'react';
import { IndianRupee, BarChart3, Box, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BusinessKPICards({ kpiData, loading }) {
  const cards = [
    {
      title: 'Total Sales (MTD)',
      value: `₹ ${Number(kpiData?.totalRevenue?.value || 0).toLocaleString('en-IN')}`,
      growth: kpiData?.totalRevenue?.growthPercent || 0,
      icon: <IndianRupee className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      label: 'vs last month',
    },
    {
      title: 'Units Sold (MTD)',
      value: Number(kpiData?.unitsSold?.value || 0).toLocaleString('en-IN'),
      growth: kpiData?.unitsSold?.growthPercent || 0,
      icon: <BarChart3 className="w-5 h-5 text-rose-500" />,
      iconBg: 'bg-rose-50',
      label: 'vs last month',
    },
    {
      title: 'Units in Inventory',
      value: Number(kpiData?.inventory?.value || 0).toLocaleString('en-IN'),
      growth: kpiData?.inventory?.growthPercent || 0,
      icon: <Box className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      label: 'available stock',
    },
    {
      title: 'Pending Approvals',
      value: Number(kpiData?.pendingApprovals?.value || 0).toLocaleString('en-IN'),
      growth: 0,
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      label: 'action required',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const isPositive = card.growth >= 0;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}
              >
                {card.icon}
              </div>
              {card.growth !== 0 && (
                <div
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {card.growth}%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {card.title}
              </p>
              {loading ? (
                <div className="animate-pulse bg-gray-100 h-8 w-28 rounded-md my-1"></div>
              ) : (
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight my-0.5">
                  {card.value}
                </h4>
              )}
              <p className="text-xs text-gray-400 font-medium">
                {card.growth !== 0
                  ? `${isPositive ? '+' : ''}${card.growth}% ${card.label}`
                  : card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
