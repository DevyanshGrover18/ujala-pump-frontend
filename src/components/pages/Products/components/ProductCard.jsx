import React from 'react';
import { Box } from 'lucide-react';

const ProductCard = ({ modelGroups, onViewModel }) => {
  return (
    <div className="md:hidden space-y-4">
      {modelGroups.map((mg) => (
        <div
          key={mg.model?._id || mg.model.name}
          className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">
                {mg.model?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-600">{mg.count || 0} Products</p>
            </div>
          </div>
          <button
            onClick={() => onViewModel(mg.model?._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Box className="h-4 w-4" />
            View Products
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
