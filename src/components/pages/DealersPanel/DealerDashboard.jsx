import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer`;
const API_URL_1 = `${import.meta.env.VITE_API_URL}/api/distributor-dealer-products/dealer-inventory`;
export default function DealerDashboard() {
  const { user } = useContext(AuthContext);
  const [productCount, setProductCount] = useState(0);
  const [subDealerCount, setSubDealerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.dealer) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // const productsResponse = await axios.get(`${API_URL}/${user.dealer._id}/products`);
        // setProductCount(productsResponse.data.length);
        const productsResponse = await axios.get(
          `${API_URL_1}/${user.dealer._id}/products`
        );
        setProductCount(productsResponse.data.length);
        // setProducts(response.data);

        const subDealersResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dealer/my-sub-dealers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setSubDealerCount(subDealersResponse.data.length);
      } catch (error) {
        toast.error('Error fetching dashboard data');
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
