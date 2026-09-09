import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Package, Truck, Users, ShoppingCart, QrCode, ArrowUpRight } from 'lucide-react';

export default function ProgressOverviewCards({ data, loading, canAccessCard }) {
  const cards = [
    {
      title: 'Total Factories',
      count: data?.factories?.total ?? 0,
      change: data?.factories?.changeThisMonth ?? 0,
      icon: <Building className="w-5 h-5" />,
      bg: '#7C3AED',
      path: '/factory-management',
    },
    {
      title: 'Total Models',
      count: data?.models?.total ?? 0,
      change: data?.models?.changeThisMonth ?? 0,
      icon: <Package className="w-5 h-5" />,
      bg: '#EF4444',
      path: '/management',
    },
    {
      title: 'Total Distributors',
      count: data?.distributors?.total ?? 0,
      change: data?.distributors?.changeThisMonth ?? 0,
      icon: <Truck className="w-5 h-5" />,
      bg: '#F59E0B',
      path: '/distributors',
    },
    {
      title: 'Total Dealers',
      count: data?.dealers?.total ?? 0,
      change: data?.dealers?.changeThisMonth ?? 0,
      icon: <Users className="w-5 h-5" />,
      bg: '#FB923C',
      path: '/dealers',
    },
    {
      title: 'Total Orders',
      count: data?.orders?.total ?? 0,
      change: data?.orders?.changeThisMonth ?? 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      bg: '#0EA5E9',
      path: '/orders',
    },
    {
      title: 'Total Products (Serial QR Codes)',
      count: data?.products?.total ?? 0,
      change: data?.products?.changeThisMonth ?? 0,
      icon: <QrCode className="w-5 h-5" />,
      bg: '#10B981',
      path: '/inventory',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards
        .filter((card) => canAccessCard(card.path))
        .map((card, index) => (
          <Link
            to={card.path}
            key={index}
            className="group block transition-all duration-200 hover:-translate-y-0.5"
          >
            <div
              className="rounded-2xl p-4 text-white shadow-sm flex flex-col justify-between h-full min-h-[135px]"
              style={{ background: card.bg }}
            >
              <div className="flex items-start justify-between">
                <div className="bg-white/20 backdrop-blur-xs p-2.5 rounded-xl inline-flex items-center justify-center text-white">
                  {card.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-white/80" />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-xs font-semibold text-white/90 line-clamp-1">
                  {card.title}
                </h3>
                {loading ? (
                  <div className="animate-pulse bg-white/20 h-7 w-16 rounded-md my-1"></div>
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-white my-0.5">
                    {card.count.toLocaleString('en-IN')}
                  </p>
                )}
                <div className="text-[11px] font-medium text-white/85 flex items-center gap-1">
                  {card.change > 0 ? (
                    <>
                      <span>↑</span> +{card.change} this month
                    </>
                  ) : (
                    <span>No change</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
