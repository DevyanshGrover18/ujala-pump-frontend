import { X, Box } from 'lucide-react';
import TableExportButtons from '../../../global/TableExportButtons';

const DealersModal = ({ isOpen, distributor, dealers, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Dealers for {distributor?.name}
          </h3>
          <div className="flex items-center space-x-4">
            {dealers && dealers.length > 0 && (
              <TableExportButtons
                exportName={`${distributor?.name || 'Distributor'}_Dealers`}
                exportData={dealers.map(d => ({
                  'Dealer ID': d.dealerId,
                  'Name': d.name,
                  'Location': d.location,
                  'Sub-Dealers': typeof d.subDealerCount !== 'undefined' ? d.subDealerCount : (d.subDealers ? d.subDealers.length : 0),
                  'Status': d.status
                }))}
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

        <div className="mt-4">
          {dealers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full responsive-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dealer ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sub-Dealers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dealers.map((dealer) => (
                    <tr key={dealer._id}>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        data-label="Dealer ID"
                      >
                        {dealer.dealerId}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        data-label="Name"
                      >
                        {dealer.name}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        data-label="Location"
                      >
                        {dealer.location}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        data-label="Sub-Dealers"
                      >
                        <button className="inline-flex items-center px-2.5 py-1.5 border border-[#4d55f5] text-xs font-medium rounded text-[#4d55f5] hover:bg-[#4d55f5] hover:text-white transition-colors">
                          <Box className="h-4 w-4 mr-1" />
                          {typeof dealer.subDealerCount !== 'undefined'
                            ? dealer.subDealerCount
                            : dealer.subDealers
                              ? dealer.subDealers.length
                              : 0}{' '}
                          Sub-Dealers
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        data-label="Status"
                      >
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${dealer.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {dealer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No dealers found for this distributor
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealersModal;
