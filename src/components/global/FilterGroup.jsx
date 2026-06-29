import React from 'react';
import { ChevronDown } from 'lucide-react';

export function FilterGroup({ children }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function FilterItem({ children }) {
  return <div className="flex-grow sm:flex-grow-0">{children}</div>;
}

export function FilterSelector({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}) {
  return (
    <div className="relative w-full sm:w-48">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none`}
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
