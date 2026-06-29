import { useState, useEffect } from 'react';
import { Search, Building, User, Package, Filter, X } from 'lucide-react';
import axios from 'axios';
import {
  FilterGroup,
  FilterItem,
  FilterSelector,
} from '../../../global/FilterGroup';

const API_URL = import.meta.env.VITE_API_URL;

export function SaleFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  distributorFilter,
  onDistributorFilterChange,
  factoryFilter,
  onFactoryFilterChange,
  serialNumber,
  onSerialNumberChange,
  modelFilter,
  onModelFilterChange,
  dealerFilter,
  onDealerFilterChange,
  onClearFilters,
}) {
  const [distributors, setDistributors] = useState([]);
  const [factories, setFactories] = useState([]);
  const [models, setModels] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distributorsRes, factoriesRes, modelsRes, dealersRes] =
          await Promise.all([
            axios.get(`${API_URL}/api/distributors`),
            axios.get(`${API_URL}/api/factories`),
            axios.get(`${API_URL}/api/models`),
            axios.get(`${API_URL}/api/dealers`),
          ]);
        setDistributors(distributorsRes.data);
        setFactories(factoriesRes.data);
        setModels(modelsRes.data);
        setDealers(dealersRes.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block space-y-4">
        <FilterGroup>
          <FilterItem>
            <div className="relative flex-grow w-100">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
            </div>
          </FilterItem>
        </FilterGroup>

        <FilterGroup>
          <FilterItem>
            <div className="relative w-full sm:w-48">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                title="Start Date"
              />
            </div>
          </FilterItem>
          <FilterItem>
            <div className="relative w-full sm:w-48">
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                title="End Date"
              />
            </div>
          </FilterItem>
          <FilterItem>
            <FilterSelector
              value={distributorFilter}
              onChange={onDistributorFilterChange}
              options={distributors}
              placeholder="All Distributors"
              icon={User}
            />
          </FilterItem>
          <FilterItem>
            <FilterSelector
              value={factoryFilter}
              onChange={onFactoryFilterChange}
              options={factories}
              placeholder="All Factories"
              icon={Building}
            />
          </FilterItem>
          <FilterItem>
            <FilterSelector
              value={modelFilter}
              onChange={onModelFilterChange}
              options={models}
              placeholder="All Models"
              icon={Package}
            />
          </FilterItem>
          <FilterItem>
            <FilterSelector
              value={dealerFilter}
              onChange={onDealerFilterChange}
              options={dealers}
              placeholder="All Dealers"
              icon={User}
            />
          </FilterItem>
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

      {/* Mobile Filters */}
      <div className="lg:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
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
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    onDateRangeChange({
                      ...dateRange,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    onDateRangeChange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distributor
                </label>
                <select
                  value={distributorFilter}
                  onChange={(e) => onDistributorFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Distributors</option>
                  {distributors.map((distributor) => (
                    <option key={distributor._id} value={distributor._id}>
                      {distributor.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  Dealer
                </label>
                <select
                  value={dealerFilter}
                  onChange={(e) => onDealerFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Dealers</option>
                  {dealers.map((dealer) => (
                    <option key={dealer._id} value={dealer._id}>
                      {dealer.name}
                    </option>
                  ))}
                </select>
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
