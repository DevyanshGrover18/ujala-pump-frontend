export function StatusTabs({ status, onStatusChange }) {
  const tabs = [
    { key: 'Pending', label: 'Pending' },
    { key: 'Completed', label: 'Completed' },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onStatusChange(tab.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors text-center ${
            status === tab.key
              ? 'bg-[#4d55f5] text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
