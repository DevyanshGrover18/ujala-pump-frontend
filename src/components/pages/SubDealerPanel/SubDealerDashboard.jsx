import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubDealerDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    soldProducts: 0,
    availableProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'subdealer') {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dealer-subdealer-products/subdealer/my-products`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const products = response.data;
      const totalProducts = products.length;
      const soldProducts = products.filter((p) => p.product?.sold).length;
      const availableProducts = totalProducts - soldProducts;

      setStats({
        totalProducts,
        soldProducts,
        availableProducts,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(
        'Error fetching dashboard data: ' +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const cardData = [
    {
      title: 'Available Products',
      count: stats.availableProducts,
      icon: <Package className="w-5 h-5" />,
      bg: '#10B981',
      path: '/sub-dealer/products',
    },
    {
      title: 'Sold Products',
      count: stats.soldProducts,
      icon: <ShoppingBag className="w-5 h-5" />,
      bg: '#EF4444',
      path: '/sub-dealer/sales',
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
