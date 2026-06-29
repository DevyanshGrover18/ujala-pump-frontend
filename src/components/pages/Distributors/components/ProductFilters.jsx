import { Search, Building, Package } from 'lucide-react';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../../global/FilterGroup';

export function ProductFilters({
  searchTerm,
  onSearchChange,
  factoryFilter,
  onFactoryFilterChange,
  modelFilter,
  onModelFilterChange,
  startSerialNumber,
  onStartSerialNumberChange,
  endSerialNumber,
  onEndSerialNumberChange,
  onSelectRange,
  onClearRange,
  factories,
  models,
  onClearFilters,
}) {
  return (
    <div className="space-y-4">
      <FilterGroup>
        <FilterItem>
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Model, serial number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          </div>
        </FilterItem>
        {/* <FilterItem>
          <FilterSelector
            value={factoryFilter}
            onChange={onFactoryFilterChange}
            options={factories}
            placeholder="All Factories"
            icon={Building}
          />
        </FilterItem> */}
        <FilterItem>
          <FilterSelector
            value={modelFilter}
            onChange={onModelFilterChange}
            options={models}
            placeholder="All Models"
            icon={Package}
          />
        </FilterItem>
        {/* <FilterItem>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Start Serial"
              value={startSerialNumber}
              onChange={(e) => onStartSerialNumberChange(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="End Serial"
              value={endSerialNumber}
              onChange={(e) => onEndSerialNumberChange(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
            <button
              onClick={onSelectRange}
              className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Apply Range
            </button>
            <button
              onClick={onClearRange}
              className="px-3 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Clear Range
            </button>
          </div>
        </FilterItem> */}
        <FilterItem>
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            <span>Clear Filters</span>
          </button>
        </FilterItem>
      </FilterGroup>
    </div>
  );
}
