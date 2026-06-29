import { useState, useEffect } from 'react';
import { Search, X, BoxSelect, MinusSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const itemsPerPage = 10;

export default function OrderDetailsModal({
  isOpen,
  onClose,
  selectedOrder,
  allOrders,
  handleStatusChange,
  downloadMultiplePDFs,
}) {
  const [modalActiveTab, setModalActiveTab] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Add itemsPerPage state
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [startSerialNumber, setStartSerialNumber] = useState('');
  const [endSerialNumber, setEndSerialNumber] = useState('');
  // Range validation modal state
  const [rangeErrorModalOpen, setRangeErrorModalOpen] = useState(false);
  const [rangeErrorMessage, setRangeErrorMessage] = useState('');
  const [availableRange, setAvailableRange] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModalActiveTab('all');
      setOrderSearchTerm('');
      setCurrentPage(1);
      setSelectedItems([]);
      setStartSerialNumber('');
      setEndSerialNumber('');
    }
  }, [isOpen, selectedOrder]);

  if (!isOpen || !selectedOrder) return null;

  const relatedOrders = allOrders.filter(
    (order) => order.orderId === selectedOrder.orderId
  );

  const filteredOrders = relatedOrders.filter((item) => {
    const matchesSearch =
      orderSearchTerm === '' ||
      item.serialNumber
        ?.toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());

    // ## FIX: Simplified and corrected the status filtering logic ##
    const matchesStatus =
      modalActiveTab === 'all' || item.status.toLowerCase() === modalActiveTab;

    return matchesSearch && matchesStatus;
  });

  const groupedOrders = Object.entries(
    filteredOrders.reduce((groups, item) => {
      const boxKey = `Box-${item.boxNumber || 'N/A'}`;
      if (!groups[boxKey]) {
        groups[boxKey] = {
          boxNumber: item.boxNumber,
          orderId: item.orderId,
          category: item.category,
          model: item.model,
          orderType: item.orderType,
          items: [],
        };
      }
      groups[boxKey].items.push(item);
      return groups;
    }, {})
  );

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);
  const paginatedOrders = groupedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedItems.length === filteredOrders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredOrders.map((item) => item._id));
    }
  };

  const handleDownloadClick = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to download.');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pdf/download-combined`,
        { itemIds: selectedItems },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `combined-stickers-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Combined PDF downloaded successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error downloading combined PDF.'
      );
      console.error('Combined PDF Download Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWarrantyDownload = async (items) => {
    if (items.length === 0) {
      toast.error('Please select items to download warranty stickers.');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/warranty-stickers`,
        {
          items: items.map((item) => ({
            serialNumber: item.serialNumber,
            modelName: item.model?.name,
          })),
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `warranty-stickers-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Warranty stickers downloaded successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error downloading warranty stickers.'
      );
      console.error('Warranty Sticker Download Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getSerialCounter = (serialNumber) => {
    if (!serialNumber) return 0;
    const match = serialNumber.match(/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleSelectRange = () => {
    if (!startSerialNumber || !endSerialNumber) {
      toast.error('Please enter both start and end serial numbers.');
      return;
    }
    const startCounter = getSerialCounter(startSerialNumber);
    const endCounter = getSerialCounter(endSerialNumber);
    if (startCounter === 0 || endCounter === 0 || startCounter > endCounter) {
      toast.error('Invalid serial number format or range.');
      return;
    }
    // compute available counters from filteredOrders
    const counters = filteredOrders
      .map((i) => getSerialCounter(i.serialNumber))
      .filter((n) => n > 0);
    if (counters.length > 0) {
      const minCounter = Math.min(...counters);
      const maxCounter = Math.max(...counters);
      if (startCounter < minCounter || endCounter > maxCounter) {
        // compute displayable serials for min/max
        const sorted = filteredOrders
          .slice()
          .sort(
            (a, b) =>
              getSerialCounter(a.serialNumber) -
              getSerialCounter(b.serialNumber)
          );
        const minSerial = sorted[0]?.serialNumber || '';
        const maxSerial = sorted[sorted.length - 1]?.serialNumber || '';
        setRangeErrorMessage('Selected range exceeds available range');
        setAvailableRange(`${minSerial} - ${maxSerial}`);
        setRangeErrorModalOpen(true);
        return;
      }
    }
    const range = filteredOrders.filter((item) => {
      const itemCounter = getSerialCounter(item.serialNumber);
      return itemCounter >= startCounter && itemCounter <= endCounter;
    });
    if (range.length === 0) {
      toast.error('No items found in the specified range.');
      return;
    }
    const itemIds = range.map((item) => item._id);
    setSelectedItems(itemIds); // Changed to replace existing selection
  };

  const handleUnselectRange = () => {
    if (!startSerialNumber || !endSerialNumber) {
      toast.error(
        'Please enter both start and end serial numbers to unselect.'
      );
      return;
    }
    const startCounter = getSerialCounter(startSerialNumber);
    const endCounter = getSerialCounter(endSerialNumber);
    if (startCounter === 0 || endCounter === 0 || startCounter > endCounter) {
      toast.error('Invalid serial number format or range.');
      return;
    }
    // compute available counters from filteredOrders
    const counters = filteredOrders
      .map((i) => getSerialCounter(i.serialNumber))
      .filter((n) => n > 0);
    if (counters.length > 0) {
      const minCounter = Math.min(...counters);
      const maxCounter = Math.max(...counters);
      if (startCounter < minCounter || endCounter > maxCounter) {
        const sorted = filteredOrders
          .slice()
          .sort(
            (a, b) =>
              getSerialCounter(a.serialNumber) -
              getSerialCounter(b.serialNumber)
          );
        const minSerial = sorted[0]?.serialNumber || '';
        const maxSerial = sorted[sorted.length - 1]?.serialNumber || '';
        setRangeErrorMessage('Selected range exceeds available range');
        setAvailableRange(`${minSerial} - ${maxSerial}`);
        setRangeErrorModalOpen(true);
        return;
      }
    }
    const rangeItemIds = filteredOrders
      .filter((item) => {
        const itemCounter = getSerialCounter(item.serialNumber);
        return itemCounter >= startCounter && itemCounter <= endCounter;
      })
      .map((item) => item._id);
    if (rangeItemIds.length === 0) {
      toast.error('No items found in the specified range to unselect.');
      return;
    }
    setSelectedItems((prev) => prev.filter((id) => !rangeItemIds.includes(id)));
  };

  // small inline modal JSX for range error (rendered below inside main overlay)

  const downloadPDF = (boxKey, download = false) => {
    const url = `${import.meta.env.VITE_API_URL}/api/pdf/stickers/${boxKey}${download ? '?download=true' : ''}`;
    if (download) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `stickers-${boxKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
  };

  const selectedOrderItems = relatedOrders.filter((item) =>
    selectedItems.includes(item._id)
  );
  const canBulkDispatchSelected =
    selectedOrderItems.length > 0 &&
    selectedOrderItems.every((item) => item.status === 'Completed');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
              Order Details - {selectedOrder.orderId}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full overflow-x-auto">
              {['all', 'pending', 'completed', 'dispatched'].map((tab) => {
                const count =
                  tab === 'all'
                    ? relatedOrders.length
                    : relatedOrders.filter(
                        (order) => order.status.toLowerCase() === tab
                      ).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setModalActiveTab(tab)}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${modalActiveTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by serial number..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {selectedItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                <span className="text-xs sm:text-sm text-blue-700 font-medium block">
                  {selectedItems.length} item(s) selected
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    id="bulk-status-select"
                    onChange={(e) =>
                      handleStatusChange(selectedItems, e.target.value)
                    }
                    className="px-3 py-2 bg-white border border-gray-300 text-xs sm:text-sm rounded hover:bg-gray-100"
                    defaultValue=""
                  >
                    <option value="">Update Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option
                      value="Dispatched"
                      disabled={!canBulkDispatchSelected}
                    >
                      Dispatched
                    </option>
                  </select>
                  <button
                    onClick={handleDownloadClick}
                    disabled={isDownloading || selectedItems.length === 0}
                    className="px-3 py-2 bg-purple-600 text-white text-xs sm:text-sm rounded hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      'Download PDFs'
                    )}
                  </button>
                  <button
                    onClick={() => handleWarrantyDownload(selectedOrderItems)}
                    disabled={isDownloading || selectedItems.length === 0}
                    className="px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      'Download Warranty Stickers'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-h-0">
          {paginatedOrders.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-600 border-gray-300 rounded"
                  />
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Select All ({filteredOrders.length})
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Start Serial"
                    value={startSerialNumber}
                    onChange={(e) => setStartSerialNumber(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="End Serial"
                    value={endSerialNumber}
                    onChange={(e) => setEndSerialNumber(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white text-xs sm:text-sm"
                  />
                  <button
                    onClick={handleSelectRange}
                    className="px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 text-xs sm:text-sm"
                    title="Select Range"
                  >
                    Select Range
                  </button>
                  <button
                    onClick={handleUnselectRange}
                    className="px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 text-xs sm:text-sm"
                    title="Unselect Range"
                  >
                    Unselect Range
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-xs sm:text-sm"
                    title="Clear Selection"
                  >
                    Clear
                  </button>
                </div>
              </div>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Box
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Serial Numbers
                      </th>
                      {/* <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th> */}
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Model
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Completed
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Dispatched
                      </th>
                      <th className="p-3 lg:p-4 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map(([boxKey, boxData]) => {
                      const validCompletionDates = boxData.items
                        .map((item) => item.completedAt)
                        .filter(Boolean)
                        .map((date) => new Date(date));
                      const latestCompletionDate = validCompletionDates.length
                        ? new Date(Math.max.apply(null, validCompletionDates))
                        : null;

                      const validDispatchDates = boxData.items
                        .map((item) => item.dispatchedAt)
                        .filter(Boolean)
                        .map((date) => new Date(date));
                      const latestDispatchDate = validDispatchDates.length
                        ? new Date(Math.max.apply(null, validDispatchDates))
                        : null;

                      return (
                        <tr key={boxKey} className="hover:bg-gray-50">
                          <td className="p-3 lg:p-4">
                            <input
                              type="checkbox"
                              checked={boxData.items.every((item) =>
                                selectedItems.includes(item._id)
                              )}
                              onChange={() => {
                                const itemIds = boxData.items.map(
                                  (item) => item._id
                                );
                                const allBoxItemsSelected = boxData.items.every(
                                  (item) => selectedItems.includes(item._id)
                                );
                                setSelectedItems((prev) =>
                                  allBoxItemsSelected
                                    ? prev.filter((id) => !itemIds.includes(id))
                                    : [...new Set([...prev, ...itemIds])]
                                );
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                            />
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-900">
                            Box {boxData.boxNumber}
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm font-medium text-gray-900">
                            <div>
                              {boxData.items.map((it) => (
                                <div key={it._id} className="break-all">
                                  {it.serialNumber}
                                </div>
                              ))}
                            </div>
                          </td>
                          {/* <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-900">{boxData.category?.name}</td> */}
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-900">
                            {boxData.model?.name}
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm">
                            <span
                              className={`px-2 whitespace-nowrap py-1 text-xs font-medium rounded-full ${boxData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : boxData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}
                            >
                              {boxData.orderType === '2_units'
                                ? '2 Units'
                                : boxData.orderType === '3_units'
                                  ? '3 Units'
                                  : '1 Unit'}
                            </span>
                          </td>
                          <td className="p-3 lg:p-4">
                            <select
                              value={boxData.items[0].status}
                              onChange={(e) =>
                                handleStatusChange(
                                  boxData.items.map((item) => item._id),
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option
                                value="Dispatched"
                                disabled={
                                  !boxData.items.every(
                                    (item) => item.status === 'Completed'
                                  )
                                }
                              >
                                Dispatched
                              </option>
                            </select>
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-500">
                            {latestCompletionDate
                              ? new Date(
                                  latestCompletionDate
                                ).toLocaleDateString('en-GB')
                              : '-'}
                          </td>
                          <td className="p-3 lg:p-4 text-xs lg:text-sm text-gray-500">
                            {latestDispatchDate
                              ? new Date(latestDispatchDate).toLocaleDateString(
                                  'en-GB'
                                )
                              : '-'}
                          </td>
                          <td className="p-3 lg:p-4">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() =>
                                  downloadPDF(
                                    `${boxData.orderId}-Box-${boxData.boxNumber}`,
                                    false
                                  )
                                }
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  downloadPDF(
                                    `${boxData.orderId}-Box-${boxData.boxNumber}`,
                                    true
                                  )
                                }
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  handleWarrantyDownload(boxData.items)
                                }
                                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                              >
                                Warranty
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {paginatedOrders.map(([boxKey, boxData]) => {
                  const validCompletionDates = boxData.items
                    .map((item) => item.completedAt)
                    .filter(Boolean)
                    .map((date) => new Date(date));
                  const latestCompletionDate = validCompletionDates.length
                    ? new Date(Math.max.apply(null, validCompletionDates))
                    : null;
                  const validDispatchDates = boxData.items
                    .map((item) => item.dispatchedAt)
                    .filter(Boolean)
                    .map((date) => new Date(date));
                  const latestDispatchDate = validDispatchDates.length
                    ? new Date(Math.max.apply(null, validDispatchDates))
                    : null;

                  return (
                    <div
                      key={boxKey}
                      className="bg-white border border-gray-200 rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={boxData.items.every((item) =>
                              selectedItems.includes(item._id)
                            )}
                            onChange={() => {
                              const itemIds = boxData.items.map(
                                (item) => item._id
                              );
                              const allBoxItemsSelected = boxData.items.every(
                                (item) => selectedItems.includes(item._id)
                              );
                              setSelectedItems((prev) =>
                                allBoxItemsSelected
                                  ? prev.filter((id) => !itemIds.includes(id))
                                  : [...new Set([...prev, ...itemIds])]
                              );
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Box {boxData.boxNumber}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {boxData.category?.name} - {boxData.model?.name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${boxData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : boxData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {boxData.orderType === '2_units'
                            ? '2 Units'
                            : boxData.orderType === '3_units'
                              ? '3 Units'
                              : '1 Unit'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Serial Numbers:
                          </p>
                          <div className="text-xs text-gray-900 space-y-1">
                            {boxData.items.map((it) => (
                              <div key={it._id} className="break-all">
                                {it.serialNumber}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-gray-600">
                              Completed:
                            </span>
                            <p className="text-gray-900">
                              {latestCompletionDate
                                ? new Date(
                                    latestCompletionDate
                                  ).toLocaleDateString('en-GB')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Dispatched:
                            </span>
                            <p className="text-gray-900">
                              {latestDispatchDate
                                ? new Date(
                                    latestDispatchDate
                                  ).toLocaleDateString('en-GB')
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={boxData.items[0].status}
                          onChange={(e) =>
                            handleStatusChange(
                              boxData.items.map((item) => item._id),
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 text-xs font-medium border border-gray-200 rounded-md cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option
                            value="Dispatched"
                            disabled={
                              !boxData.items.every(
                                (item) => item.status === 'Completed'
                              )
                            }
                          >
                            Dispatched
                          </option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              downloadPDF(
                                `${boxData.orderId}-Box-${boxData.boxNumber}`,
                                false
                              )
                            }
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              downloadPDF(
                                `${boxData.orderId}-Box-${boxData.boxNumber}`,
                                true
                              )
                            }
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Download
                          </button>
                          <button
                            onClick={() =>
                              handleWarrantyDownload(boxData.items)
                            }
                            className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Warranty
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No items match your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-700 flex items-center">
                <span className="mr-2">Rows per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs sm:text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {rangeErrorModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRangeErrorModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-70 w-full max-w-md p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <h4 className="text-base sm:text-lg font-semibold">
                Range Error
              </h4>
              <button
                onClick={() => setRangeErrorModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 text-xs sm:text-sm text-gray-700">
              <p>
                {rangeErrorMessage}{' '}
                <span className="font-medium break-all">
                  ({availableRange})
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setRangeErrorModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
