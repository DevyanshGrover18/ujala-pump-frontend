import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import ProgressOverviewCards from './components/ProgressOverviewCards';
import BusinessKPICards from './components/BusinessKPICards';
import SalesTrendChart from './components/SalesTrendChart';
import OrderItemsPieChart from './OrderItemsPieChart';
import TopSellingModels from './components/TopSellingModels';
import RecentOrdersTable from './components/RecentOrdersTable';
import LowStockAlertCard from './components/LowStockAlertCard';
import RecentActivityTimeline from './components/RecentActivityTimeline';
import PartnerSummaryCard from './components/PartnerSummaryCard';
import PendingActionsCard from './components/PendingActionsCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, hasAnyPrivilege } = useContext(AuthContext);

  const [overviewData, setOverviewData] = useState(null);

  const cardPathToSection = {
    '/factory-management': 'factories',
    '/management': 'management',
    '/distributors': 'distributors',
    '/dealers': 'dealers',
    '/orders': 'orders',
    '/inventory': 'products',
  };

  const canAccessCard = (path) => {
    if (isAdmin) return true;
    const section = cardPathToSection[path];
    if (!section) return false;
    return hasAnyPrivilege(section);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/overview`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOverviewData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-400 mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name || user?.username || 'Admin'}! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* 2. Progress Overview (6 Cards) */}
      <section>
        <ProgressOverviewCards
          data={overviewData?.progressOverview}
          loading={loading}
          canAccessCard={canAccessCard}
        />
      </section>

      {/* 3. Business KPI Overview (4 Cards) */}
      <section>
        <BusinessKPICards
          kpiData={overviewData?.businessKPIs}
          loading={loading}
        />
      </section>

      {/* 4. Analytics & Performance Row (Order Status, Sales Trend, Top Selling Models) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <OrderItemsPieChart />
        </div>
        <div className="lg:col-span-1">
          <SalesTrendChart />
        </div>
        <div className="lg:col-span-1">
          <TopSellingModels />
        </div>
      </section>

      {/* 5. Operations Row (Recent Orders, Low Stock Alerts, Recent Activity) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlertCard />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityTimeline />
        </div>
      </section>

      {/* 6. Partner Summary */}
      <section>
        <PartnerSummaryCard />
      </section>

      {/* 7. Pending Actions Action Center */}
      <section>
        <PendingActionsCard />
      </section>
    </div>
  );
}
