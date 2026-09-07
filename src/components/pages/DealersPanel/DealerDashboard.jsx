import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL_1 = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer-inventory`;

export default function DealerDashboard() {
  const { user } = useContext(AuthContext);
  const [productCount, setProductCount] = useState(0);
  const [subDealerCount, setSubDealerCount] = useState(0);
  const [walletInfo, setWalletInfo] = useState({
    incentive: null,
    points: null,
    eligibleForIncentive: true,
    eligibleForPoints: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.dealer) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const productsResponse = await axios.get(
          `${API_URL_1}/${user.dealer._id}/products`
        );
        setProductCount(productsResponse.data.length);

        const subDealersResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dealer/my-sub-dealers`,
          { headers }
        );
        setSubDealerCount(subDealersResponse.data.length);

        // Fetch wallet status
        const walletRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/incentives/my/claims`,
          { headers }
        );
        if (walletRes.data) {
          setWalletInfo({
            incentive: walletRes.data.wallet?.incentive,
            points: walletRes.data.wallet?.points,
            eligibleForIncentive: walletRes.data.eligibleForIncentive !== false,
            eligibleForPoints: walletRes.data.eligibleForPoints !== false,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const cardData = [
    {
      title: 'Total Inventory',
      count: productCount,
      icon: <Package className="w-5 h-5" />,
      bg: '#EF4444',
      path: '/dealer/products',
    },
    {
      title: 'Total Sub-Dealers',
      count: subDealerCount,
      icon: <Users className="w-5 h-5" />,
      bg: '#3B82F6',
      path: '/dealer/sub-dealers',
    },
  ];

  if (walletInfo.eligibleForIncentive && typeof walletInfo.incentive === 'number') {
    cardData.push({
      title: 'Wallet Incentive',
      count: `₹${walletInfo.incentive.toLocaleString('en-IN')}`,
      icon: <Wallet className="w-5 h-5" />,
      bg: '#10B981',
      path: '/dealer/wallet',
    });
  } else if (walletInfo.eligibleForPoints && typeof walletInfo.points === 'number') {
    cardData.push({
      title: 'Wallet Points',
      count: `${walletInfo.points.toLocaleString('en-IN')} pts`,
      icon: <Wallet className="w-5 h-5" />,
      bg: '#10B981',
      path: '/dealer/wallet',
    });
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
