import React from 'react';
import { Box } from 'lucide-react';
import TableExportButtons from '../../../global/TableExportButtons';

const ProductTable = ({ modelGroups, onViewModel }) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <div className="flex justify-end mb-4 px-4">
        <TableExportButtons
          exportName="Products_Models_List"
          exportData={modelGroups.map(mg => ({
            'Model': mg.model?.name || 'Unknown',
            'No. of Products': mg.count || 0
          }))}
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No. of Products
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {modelGroups.map((mg) => (
            <tr
              key={mg.model?._id || mg.model.name}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {mg.model?.name || 'Unknown'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewModel(mg.model?._id)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors"
                >
                  <Box className="h-4 w-4 mr-1" />
                  {mg.count || 0} Total Products
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
