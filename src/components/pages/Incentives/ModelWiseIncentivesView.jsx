import React, { useState, useMemo } from 'react';
import {
  Box,
  Package,
  IndianRupee,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import TableExportButtons from '../../global/TableExportButtons';

const STATUS_BADGE = {
  'Approval Pending': 'bg-amber-50 text-amber-800 border border-amber-200/80',
  Approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
  Rejected: 'bg-rose-50 text-rose-800 border border-rose-200/80',
  Incomplete: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const STATUS_ICON = {
  'Approval Pending': Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
};

export default function ModelWiseIncentivesView({
  groups = [],
  loading = false,
  startDate = '',
  endDate = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('All');
  const [modalPage, setModalPage] = useState(1);
  const MODAL_PER_PAGE = 10;

  // Flatten all items across groups
  const allItems = useMemo(() => {
    const items = [];
    (groups || []).forEach((g) => {
      const gItems = g.items && g.items.length > 0 ? g.items : [g];
      gItems.forEach((item) => {
        items.push({
          ...item,
          groupSellerName: g.sellerName || item.sellerName,
          groupSellerType: g.sellerType || item.sellerType,
          groupSellerId: g.sellerId || item.sellerId,
          groupProcessedBy: g.processedBy || item.processedBy,
          groupProcessedAt: g.processedAt || item.processedAt,
          claimDate: item.claimDate || g.claimDate || item.createdAt || g.createdAt,
          status: item.status || g.status,
          rejectionReason: item.rejectionReason || g.rejectionReason,
        });
      });
    });
    return items;
  }, [groups]);

  // Group items by modelName
  const modelGroups = useMemo(() => {
    const map = new Map();

    allItems.forEach((item) => {
      const name = (item.modelName || item.model?.name || 'Unknown Model').trim();
      const key = name.toUpperCase();

      if (!map.has(key)) {
        map.set(key, {
          modelName: name,
          count: 0,
          totalIncentive: 0,
          totalPoints: 0,
          approvedCount: 0,
          approvedIncentive: 0,
          pendingCount: 0,
          pendingIncentive: 0,
          rejectedCount: 0,
          items: [],
        });
      }

      const mg = map.get(key);
      mg.count += 1;
      const inc = Number(item.incentiveAmount) || 0;
      const pts = Number(item.points) || 0;
      mg.totalIncentive += inc;
      mg.totalPoints += pts;
      mg.items.push(item);

      if (item.status === 'Approved') {
        mg.approvedCount += 1;
        mg.approvedIncentive += inc;
      } else if (item.status === 'Approval Pending') {
        mg.pendingCount += 1;
        mg.pendingIncentive += inc;
      } else if (item.status === 'Rejected') {
        mg.rejectedCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allItems]);

  // Filter models by search
  const filteredModelGroups = useMemo(() => {
    if (!searchTerm.trim()) return modelGroups;
    const term = searchTerm.toLowerCase();
    return modelGroups.filter((mg) => mg.modelName.toLowerCase().includes(term));
  }, [modelGroups, searchTerm]);

  // Calculate high-level summary totals
  const totalSummary = useMemo(() => {
    return filteredModelGroups.reduce(
      (acc, mg) => {
        acc.models += 1;
        acc.products += mg.count;
        acc.incentive += mg.totalIncentive;
        acc.approvedIncentive += mg.approvedIncentive;
        acc.points += mg.totalPoints;
        return acc;
      },
      { models: 0, products: 0, incentive: 0, approvedIncentive: 0, points: 0 }
    );
  }, [filteredModelGroups]);

  // Filter items inside modal for active model
  const modalFilteredItems = useMemo(() => {
    if (!selectedModel) return [];
    let items = selectedModel.items || [];

    if (modalStatusFilter !== 'All') {
      items = items.filter((i) => i.status === modalStatusFilter);
    }

    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      items = items.filter((i) => {
        const serial = (i.serialNumber || i.product?.serialNumber || '').toLowerCase();
        const seller = (i.sellerName || i.groupSellerName || '').toLowerCase();
        const type = (i.sellerType || i.groupSellerType || '').toLowerCase();
        return serial.includes(q) || seller.includes(q) || type.includes(q);
      });
    }

    return items;
  }, [selectedModel, modalStatusFilter, modalSearch]);

  const modalTotalPages = Math.max(1, Math.ceil(modalFilteredItems.length / MODAL_PER_PAGE));
  const paginatedModalItems = useMemo(() => {
    const start = (modalPage - 1) * MODAL_PER_PAGE;
    return modalFilteredItems.slice(start, start + MODAL_PER_PAGE);
  }, [modalFilteredItems, modalPage]);

  const openModelModal = (mg) => {
    setSelectedModel(mg);
    setModalSearch('');
    setModalStatusFilter('All');
    setModalPage(1);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Controls & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search model name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-600 px-3.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <span>
              Models: <strong className="text-slate-900 font-semibold">{totalSummary.models}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Units: <strong className="text-slate-900 font-semibold">{totalSummary.products}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Total Incentive:{' '}
              <strong className="text-slate-900 font-semibold font-mono">
                ₹{totalSummary.incentive.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>

          <TableExportButtons
            exportName={`Model_Wise_Incentives_${startDate || 'all'}_to_${endDate || 'all'}`}
            exportData={filteredModelGroups.map((mg) => ({
              'Model Name': mg.modelName,
              'Total Products Sold': mg.count,
              'Total Incentives (₹)': mg.totalIncentive,
              'Paid Incentives (₹)': mg.approvedIncentive,
              'Pending Incentives (₹)': mg.pendingIncentive,
              'Paid Count': mg.approvedCount,
              'Pending Count': mg.pendingCount,
              'Total Points': mg.totalPoints,
            }))}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Incentive Given
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status Breakdown
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading model wise data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredModelGroups.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-sm text-slate-500">
                    <Package className="mx-auto h-9 w-9 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No model-wise records found.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try changing the date filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredModelGroups.map((group) => (
                  <tr
                    key={group.modelName}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => openModelModal(group)}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-900">
                          {group.modelName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModelModal(group);
                        }}
                        className="inline-flex items-center px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Package className="h-3.5 w-3.5 mr-1.5 text-slate-500 shrink-0" />
                        <span>{group.count} Products</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-900 font-mono">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                        <span>{group.totalIncentive.toLocaleString('en-IN')}</span>
                      </div>
                      {/* {group.totalPoints > 0 && (
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          +{group.totalPoints} pts
                        </p>
                      )} */}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        {group.approvedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-medium">
                            {group.approvedCount} Paid (₹{group.approvedIncentive.toLocaleString('en-IN')})
                          </span>
                        )}
                        {group.pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 text-[11px] font-medium">
                            {group.pendingCount} Pending
                          </span>
                        )}
                        {group.rejectedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/70 text-[11px] font-medium">
                            {group.rejectedCount} Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Totals Bar */}
        {filteredModelGroups.length > 0 && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-slate-600">
            <div>
              Showing <strong className="text-slate-900">{filteredModelGroups.length}</strong> model(s)
            </div>
            <div className="flex items-center gap-4">
              <span>
                Total Units: <strong className="text-slate-900">{totalSummary.products}</strong>
              </span>
              <span>
                Total Incentive:{' '}
                <strong className="text-slate-900 font-mono text-sm">
                  ₹{totalSummary.incentive.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal for Selected Model */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-700" />
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedModel.modelName}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itemized product sales and incentive details for this model.
                </p>
              </div>

              <button
                onClick={() => setSelectedModel(null)}
                className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-medium text-slate-500">Products Sold</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedModel.count}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-medium text-slate-500">Total Incentive Given</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                  ₹{selectedModel.totalIncentive.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-medium text-slate-500">Paid / Approved</p>
                <p className="text-lg font-bold text-emerald-800 mt-0.5 font-mono">
                  ₹{selectedModel.approvedIncentive.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500">({selectedModel.approvedCount})</span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-medium text-slate-500">Pending Approval</p>
                <p className="text-lg font-bold text-amber-800 mt-0.5 font-mono">
                  ₹{selectedModel.pendingIncentive.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-500">({selectedModel.pendingCount})</span>
                </p>
              </div>
            </div>

            {/* Modal Controls Toolbar */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap bg-white">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter serial, seller..."
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    setModalPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {['All', 'Approved', 'Approval Pending', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setModalStatusFilter(st);
                      setModalPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      modalStatusFilter === st
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Approved' ? 'Paid' : st === 'Approval Pending' ? 'Pending' : st}
                  </button>
                ))}
              </div>

              <TableExportButtons
                exportName={`${selectedModel.modelName}_Products_List`}
                exportData={modalFilteredItems.map((item, idx) => ({
                  '#': idx + 1,
                  'Serial Number': (item.serialNumber || item.product?.serialNumber || 'N/A').toUpperCase(),
                  'Seller Name': item.sellerName || item.groupSellerName || 'N/A',
                  'Seller Role': item.sellerType || item.groupSellerType || 'N/A',
                  'Incentive (₹)': item.incentiveAmount || 0,
                  'Points': item.points || 0,
                  'Claim Date': item.claimDate ? new Date(item.claimDate).toLocaleDateString('en-IN') : 'N/A',
                  'Status': item.status === 'Approved' ? 'Paid' : item.status,
                  'Approved By': item.groupProcessedBy?.accountsMember?.name || item.groupProcessedBy?.name || item.groupProcessedBy?.username || (item.groupProcessedBy?.role === 'admin' ? 'Admin' : 'N/A'),
                }))}
              />
            </div>

            {/* Modal Products Table */}
            <div className="flex-1 overflow-y-auto min-h-[280px]">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seller / Plumber
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Incentive
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Approved By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-xs">
                  {modalFilteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-xs text-slate-400">
                        No products match the filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedModalItems.map((item, idx) => {
                      const StatusIcon = STATUS_ICON[item.status] || Clock;
                      const serial = (item.serialNumber || item.product?.serialNumber || 'N/A').toUpperCase();
                      const processed = item.groupProcessedBy || item.processedBy;
                      const processedName =
                        processed?.accountsMember?.name ||
                        processed?.name ||
                        processed?.username ||
                        (processed?.role === 'admin' ? 'Administrator' : null);

                      return (
                        <tr key={item._id || idx} className="hover:bg-slate-50/75 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 font-mono">
                            {(modalPage - 1) * MODAL_PER_PAGE + idx + 1}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {serial}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">
                                {item.sellerName || item.groupSellerName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                {item.sellerType || item.groupSellerType}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-bold text-slate-900 font-mono">
                              <IndianRupee className="w-3 h-3 text-slate-400" />
                              <span>{(item.incentiveAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            {/* {item.points > 0 && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                +{item.points} pts
                              </span>
                            )} */}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                            {item.claimDate
                              ? new Date(item.claimDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {item.status === 'Approved' ? 'Paid' : item.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                            {processedName ? (
                              <span className="font-medium text-slate-800">{processedName}</span>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Pagination Footer */}
            {modalTotalPages > 1 && (
              <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {(modalPage - 1) * MODAL_PER_PAGE + 1}–
                  {Math.min(modalPage * MODAL_PER_PAGE, modalFilteredItems.length)} of{' '}
                  {modalFilteredItems.length} products
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                    disabled={modalPage === 1}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium">
                    {modalPage} / {modalTotalPages}
                  </span>
                  <button
                    onClick={() => setModalPage((p) => Math.min(modalTotalPages, p + 1))}
                    disabled={modalPage === modalTotalPages}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

