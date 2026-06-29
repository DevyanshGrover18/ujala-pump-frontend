import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  getFactoryOrders,
  bulkUpdateOrderStatus,
} from '../services/factoryService';
import TableExportButtons from '../../../global/TableExportButtons';

export default function FactoryOrdersModal({
  isOpen,
  onClose,
  factory,
  fetchFactories,
  initialTab,
}) {
  const [factoryOrders, setFactoryOrders] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalActiveTab, setModalActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalActiveTab(initialTab || 'all');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && factory) {
      const fetchOrders = async () => {
        const orders = await getFactoryOrders(factory._id);
        setFactoryOrders(orders);
      };
      fetchOrders();
    }
  }, [isOpen, factory]);

  const filteredOrders = useMemo(() => {
    return factoryOrders.filter((item) => {
      const matchesSearch =
        orderSearchTerm === '' ||
        item.serialNumber
          ?.toLowerCase()
          .includes(orderSearchTerm.toLowerCase()) ||
        item.orderId?.toLowerCase().includes(orderSearchTerm.toLowerCase());
      const matchesType =
        orderTypeFilter === 'all' || item.orderType === orderTypeFilter;
      const matchesStatus =
        modalActiveTab === 'all' ||
        item.status.toLowerCase() === modalActiveTab;

      const itemDate = new Date(item.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDate =
        (!start || itemDate >= start) && (!end || itemDate <= end);

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [
    factoryOrders,
    orderSearchTerm,
    orderTypeFilter,
    modalActiveTab,
    startDate,
    endDate,
  ]);

  const groupedOrders = useMemo(() => {
    return Object.entries(
      filteredOrders.reduce((groups, item) => {
        const boxKey = `${item.orderId}-Box-${item.boxNumber || 'N/A'}`;
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
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return groupedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [groupedOrders, currentPage, itemsPerPage]);

  const handleClose = () => {
    setFactoryOrders([]);
    setOrderSearchTerm('');
    setOrderTypeFilter('all');
    setCurrentPage(1);
    setSelectedItems([]);
    setModalActiveTab('all');
    setStartDate('');
    setEndDate('');
    fetchFactories();
    onClose();
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredOrders.map((item) => item._id);
    const allVisibleSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => selectedItems.includes(id));

    if (allVisibleSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleDownloadMultiplePDFs = async () => {
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

  const handleStatusChange = async (itemIds, status) => {
    await bulkUpdateOrderStatus(factory._id, itemIds, status);
    const orders = await getFactoryOrders(factory._id);
    setFactoryOrders(orders);
  };

  if (!isOpen) return null;

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

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);

  const clearFilters = () => {
    setOrderSearchTerm('');
    setOrderTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const exportData = groupedOrders.map(([boxKey, boxData]) => {
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

    return {
      'Order ID': boxData.orderId,
      'Box': `Box ${boxData.boxNumber}`,
      'Serial Number': boxData.items.map((it) => it.serialNumber).join(', '),
      'Model': boxData.model?.name || '',
      'Type':
        boxData.orderType === '2_units'
          ? '2 Units'
          : boxData.orderType === '3_units'
            ? '3 Units'
            : '1 Unit',
      'Created Date': new Date(boxData.items[0].createdAt).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      ),
      'Status': boxData.items[0].status,
      'Completed': latestCompletionDate
        ? new Date(latestCompletionDate).toLocaleDateString('en-GB')
        : '-',
      'Dispatched': latestDispatchDate
        ? new Date(latestDispatchDate).toLocaleDateString('en-GB')
        : '-',
    };
  });

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Orders for {factory?.name}
            </h3>
            <div className="flex items-center gap-4">
              <TableExportButtons
                exportName={`${factory?.name}_Orders`}
                exportData={exportData}
              />
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {['all', 'pending', 'completed', 'dispatched'].map((tab) => {
                const count =
                  tab === 'all'
                    ? factoryOrders.length
                    : factoryOrders.filter(
                      (order) => order.status.toLowerCase() === tab
                    ).length;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setModalActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${modalActiveTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                  </button>
                );
              })}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by serial number..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                >
                  <option value="all">All Order Types</option>
                  <option value="1_unit">1 Unit/Box</option>
                  <option value="2_units">2 Units/Box</option>
                  <option value="3_units">3 Units/Box</option>
                </select>
              </div>
              <div className="sm:w-48">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  title="Start Date"
                />
              </div>
              <div className="sm:w-48">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  title="End Date"
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by serial number..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedItems.length} item(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMultiplePDFs}
                    disabled={isDownloading}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                    onClick={() =>
                      handleWarrantyDownload(
                        filteredOrders.filter((item) =>
                          selectedItems.includes(item._id)
                        )
                      )
                    }
                    disabled={isDownloading || selectedItems.length === 0}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {paginatedOrders.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <input
                  type="checkbox"
                  checked={
                    filteredOrders.length > 0 &&
                    filteredOrders.every((item) =>
                      selectedItems.includes(item._id)
                    )
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Select All ({filteredOrders.length})
                </label>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        Select
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Box
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispatched
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map(([boxKey, boxData]) => {
                      const allItemsSelected = boxData.items.every((item) =>
                        selectedItems.includes(item._id)
                      );

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
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={allItemsSelected}
                              onChange={() => {
                                const itemIds = boxData.items.map(
                                  (item) => item._id
                                );
                                if (allItemsSelected) {
                                  setSelectedItems((prev) =>
                                    prev.filter((id) => !itemIds.includes(id))
                                  );
                                } else {
                                  setSelectedItems((prev) => [
                                    ...new Set([...prev, ...itemIds]),
                                  ]);
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                            {boxData.orderId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Box {boxData.boxNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="space-y-1">
                              {boxData.items.map((it) => (
                                <div key={it._id}>{it?.serialNumber}</div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {boxData.model?.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${boxData.orderType === '2_units' ? 'bg-blue-100 text-blue-800' : boxData.orderType === '3_units' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}
                            >
                              {boxData.orderType === '2_units'
                                ? '2 Units'
                                : boxData.orderType === '3_units'
                                  ? '3 Units'
                                  : '1 Unit'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              boxData.items[0].createdAt
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={boxData.items[0].status}
                              onChange={(e) =>
                                handleStatusChange(
                                  boxData.items.map((item) => item._id),
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {latestCompletionDate
                              ? new Date(
                                latestCompletionDate
                              ).toLocaleDateString('en-GB')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {latestDispatchDate
                              ? new Date(latestDispatchDate).toLocaleDateString(
                                'en-GB'
                              )
                              : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() =>
                                  downloadPDF(
                                    `${boxData.orderId}-Box-${boxData.boxNumber}`,
                                    false
                                  )
                                }
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
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
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  handleWarrantyDownload(boxData.items)
                                }
                                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
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
              <div className="md:hidden space-y-4">
                {paginatedOrders.map(([boxKey, boxData]) => {
                  const allItemsSelected = boxData.items.every((item) =>
                    selectedItems.includes(item._id)
                  );

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
                      className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allItemsSelected}
                            onChange={() => {
                              const itemIds = boxData.items.map(
                                (item) => item._id
                              );
                              if (allItemsSelected) {
                                setSelectedItems((prev) =>
                                  prev.filter((id) => !itemIds.includes(id))
                                );
                              } else {
                                setSelectedItems((prev) => [
                                  ...new Set([...prev, ...itemIds]),
                                ]);
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="font-medium text-blue-600">
                              {boxData.orderId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Box {boxData.boxNumber}
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

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Model:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {boxData.model?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Serial Numbers:</span>
                          <div className="mt-1 space-y-1">
                            {boxData.items.map((it) => (
                              <div
                                key={it._id}
                                className="font-medium text-gray-900"
                              >
                                {it?.serialNumber}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(
                              boxData.items[0].createdAt
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {latestCompletionDate && (
                          <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Date(
                                latestCompletionDate
                              ).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        )}
                        {latestDispatchDate && (
                          <div>
                            <span className="text-gray-600">Dispatched:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Date(latestDispatchDate).toLocaleDateString(
                                'en-GB'
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Status:
                        </label>
                        <select
                          value={boxData.items[0].status}
                          onChange={(e) =>
                            handleStatusChange(
                              boxData.items.map((item) => item._id),
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() =>
                            downloadPDF(
                              `${boxData.orderId}-Box-${boxData.boxNumber}`,
                              false
                            )
                          }
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          View PDF
                        </button>
                        <button
                          onClick={() =>
                            downloadPDF(
                              `${boxData.orderId}-Box-${boxData.boxNumber}`,
                              true
                            )
                          }
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleWarrantyDownload(boxData.items)}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                        >
                          Warranty
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {factoryOrders.length === 0
                ? 'No order items found for this factory'
                : 'No orders match your search criteria'}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  className="px-2 py-1 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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

              <span className="hidden sm:inline">
                Showing{' '}
                {groupedOrders.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{' '}
                to {Math.min(currentPage * itemsPerPage, groupedOrders.length)}{' '}
                of {groupedOrders.length} boxes
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-[60] lg:hidden">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Order Types</option>
                  <option value="1_unit">1 Unit/Box</option>
                  <option value="2_units">2 Units/Box</option>
                  <option value="3_units">3 Units/Box</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
