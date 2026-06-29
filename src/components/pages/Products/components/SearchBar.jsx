import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search...',
}) => {
  return (
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
      />
    </div>
  );
};

export default SearchBar;
