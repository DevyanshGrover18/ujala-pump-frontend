import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TableExportButtons from '../../global/TableExportButtons';

const API_URL = `${import.meta.env.VITE_API_URL}/api/dealer-subdealer-products`;

export default function SubDealerProductsModal({
  subDealer,
  onClose,
  isAdmin = false,
}) {
  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('models'); // 'models' or 'products'
  const [selectedModel, setSelectedModel] = useState(null);

  const modelGroups = useMemo(() => {
    const map = {};
    // Sort products by serial number in descending order before grouping
    const sortedProducts = [...(products || [])].sort(
      (a, b) =>
        getSerialCounter(b.product?.serialNumber) -
        getSerialCounter(a.product?.serialNumber)
    );

    sortedProducts.forEach((assignment) => {
      const product = assignment.product;
      if (!product) return;

      const model = product.model;
      const mid = model?._id || 'unknown';

      if (!map[mid]) {
        map[mid] = {
          model: model || { name: 'Unknown' },
          count: 0,
          products: [],
        };
      }

      map[mid].count++;
      map[mid].products.push(product);
    });
    return Object.values(map);
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [subDealer._id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin
        ? `${API_URL}/admin/subdealer/${subDealer._id}/products`
        : `${API_URL}/dealer/subdealer/${subDealer._id}/products`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setProducts(response.data);
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const getProductStatus = (product) => {
    if (product.sold)
      return { label: 'Sold', color: 'bg-red-100 text-red-800' };
    return { label: 'Available', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Products assigned to {subDealer.name} ({products.length})
          </h3>
          <div className="flex items-center space-x-4">
            {viewMode === 'models' && modelGroups.length > 0 && (
              <TableExportButtons
                exportName={`${subDealer.name || 'SubDealer'}_Products`}
                exportData={modelGroups.map(mg => ({
                  'Model Name': mg.model?.name || 'Unknown',
                  'Product Count': mg.count || 0
                }))}
              />
            )}
            {viewMode === 'products' && selectedModel && (
              <TableExportButtons
                exportName={`Model_${selectedModel.name || 'Unknown'}_Products`}
                exportData={
                  (modelGroups.find((g) => g.model?._id === selectedModel?._id)?.products || []).map(product => {
                    const assignment = products.find((a) => a.product?._id === product._id);
                    const status = getProductStatus(product);
                    return {
                      'Serial Number': product.serialNumber,
                      'Distributor': assignment?.distributor?.name || 'N/A',
                      'Status': status.label,
                      'Assigned Date': assignment?.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'
                    };
                  })
                }
              />
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : viewMode === 'models' ? (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modelGroups.map((group) => (
                    <tr key={group.model._id || 'unknown'}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {group.model.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setSelectedModel(group.model);
                            setViewMode('products');
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                        >
                          <Package className="h-4 w-4 mr-1" />
                          {group.count || 0} Products
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setViewMode('models');
                setSelectedModel(null);
              }}
              className="mb-4 text-blue-600 hover:bg-gray-200 border p-2 rounded-lg"
            >
              Back to Models
            </button>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Distributor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modelGroups
                    .find((g) => g.model?._id === selectedModel?._id)
                    ?.products.map((product) => {
                      const assignment = products.find(
                        (a) => a.product?._id === product._id
                      );
                      const status = getProductStatus(product);
                      return (
                        <tr key={product._id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.serialNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {assignment?.distributor?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(
                              assignment.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
