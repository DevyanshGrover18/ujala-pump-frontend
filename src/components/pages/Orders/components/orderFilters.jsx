import { useState } from 'react';
import { Search, Building, Package, Filter, X, ChevronDown } from 'lucide-react';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../../global/FilterGroup';

export function OrderFilters({
  searchTerm,
  onSearchChange,
  factoryFilter,
  onFactoryFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
  dispatchedFilter,
  onDispatchedFilterChange,
  modelFilter,
  onModelFilterChange,
  isManualFilter,
  onIsManualFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  factories,
  models,
  onAddOrder,
  onClearFilters,
}) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block space-y-4 w-full">
        {/* Row 1 — all controls on a single line */}
        <div className="flex items-center gap-2 flex-nowrap w-full">
          {/* Search — grows to fill remaining space */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          </div>

          {/* Factory */}
          <div className="relative w-40 shrink-0">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={factoryFilter}
              onChange={(e) => onFactoryFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
            >
              <option value="all">All Factories</option>
              {factories.map((f) => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Model */}
          <div className="relative w-40 shrink-0">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={modelFilter}
              onChange={(e) => onModelFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
            >
              <option value="all">All Models</option>
              {models.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Order type */}
          <div className="relative w-36 shrink-0">
            <select
              value={orderTypeFilter}
              onChange={(e) => onOrderTypeFilterChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
            >
              <option value="all">All Types</option>
              <option value="1_unit">1N</option>
              <option value="2_units">2N</option>
              <option value="3_units">3N</option>
              <option value="4_units">4N (4 Pumps per Box)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Manual / Normal */}
          <div className="relative w-36 shrink-0">
            <select
              value={isManualFilter}
              onChange={(e) => onIsManualFilterChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
            >
              <option value="all">All Orders</option>
              <option value="normal">Normal Orders</option>
              <option value="manual">Manual Orders</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <FilterGroup>
          <FilterItem>
            <div className="relative w-full sm:w-48">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                title="Start Date"
              />
            </div>
          </FilterItem>
          <FilterItem>
            <div className="relative w-full sm:w-48">
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                title="End Date"
              />
            </div>
          </FilterItem>
          <FilterItem>
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <span>Clear Filters</span>
            </button>
          </FilterItem>
          <FilterItem>
            <div className="flex gap-2">
              <button
                onClick={() => onAddOrder(false)}
                className="flex items-center justify-center bg-[#4d55f5] text-white px-4 py-2.5 rounded-lg hover:bg-[#3d45e5] transition-colors text-sm font-medium whitespace-nowrap"
              >
                <span>+ New Order</span>
              </button>
              <button
                onClick={() => onAddOrder(true)}
                className="flex items-center justify-center bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <span>+ New Manual Order</span>
              </button>
            </div>
          </FilterItem>
        </FilterGroup>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
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
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => onAddOrder(false)}
            className="px-4 py-2 bg-[#4d55f5] text-white rounded-lg hover:bg-[#3d45e5] transition-colors whitespace-nowrap text-sm"
          >
            + New
          </button>
          <button
            onClick={() => onAddOrder(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
          >
            + Manual
          </button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 lg:hidden">
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
                  Factory
                </label>
                <select
                  value={factoryFilter}
                  onChange={(e) => onFactoryFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Factories</option>
                  {factories.map((factory) => (
                    <option key={factory._id} value={factory._id}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={modelFilter}
                  onChange={(e) => onModelFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Models</option>
                  {models.map((model) => (
                    <option key={model._id} value={model._id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => onOrderTypeFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="1_unit">1N</option>
                  <option value="2_units">2N</option>
                  <option value="3_units">3N</option>
                  <option value="4_units">4N (4 Pumps per Box)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Source
                </label>
                <select
                  value={isManualFilter}
                  onChange={(e) => onIsManualFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="normal">Normal Orders</option>
                  <option value="manual">Manual Orders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
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
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  onClearFilters();
                  setShowFilterModal(false);
                }}
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
    </>
  );
}
