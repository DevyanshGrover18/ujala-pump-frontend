import { X } from 'lucide-react';
import ListComponent from '../../../global/ListComponent';
import TableExportButtons from '../../../global/TableExportButtons';

const SubDealersModal = ({ isOpen, dealer, subDealers, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sub-Dealers for {dealer?.name}
          </h3>
          <div className="flex items-center space-x-4">
            {subDealers && subDealers.length > 0 && (
              <TableExportButtons
                exportName={`${dealer?.name || 'Dealer'}_SubDealers`}
                exportData={subDealers.map(sd => ({
                  'ID': sd.subDealerId,
                  'Name': sd.name,
                  'Address': sd.address,
                  'City': sd.city,
                  'State': sd.state,
                  'Contact Person': sd.contactPerson,
                  'Contact Phone': sd.contactPhone,
                  'Status': sd.status
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

        <div className="mt-2">
          {subDealers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sub-dealers found.
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <ListComponent
                    items={subDealers}
                    renderItem={(sd) => (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sd.subDealerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sd.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sd.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sd.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sd.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <p>{sd.contactPerson}</p>
                            <p className="text-gray-500">{sd.contactPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${sd.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {sd.status}
                          </span>
                        </td>
                      </>
                    )}
                    itemContainer="tr"
                    listContainer="tbody"
                    itemClassName="hover:bg-gray-50"
                    listClassName="bg-white divide-y divide-gray-200"
                  />
                </table>
              </div>

              {/* mobile */}
              <div className="md:hidden space-y-3">
                {subDealers.map((sd) => (
                  <div key={sd._id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {sd.name}{' '}
                          <span className="text-xs text-gray-500 ml-2">
                            {sd.subDealerId}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600">{sd.address}</p>
                        <p className="text-sm text-gray-600">
                          {sd.city}, {sd.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">
                          {sd.contactPerson}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sd.contactPhone}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${sd.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {sd.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubDealersModal;
