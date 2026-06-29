import { useState } from 'react';
import { Package, Tag } from 'lucide-react';
import Categories from './Categories';
import Models from './Models';
import TableExportButtons from '../../global/TableExportButtons';

const Management = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-gray-300 p-1 rounded-lg w-fit">
          <TabButton
            id="categories"
            label="Categories"
            icon={Tag}
            isActive={activeTab === 'categories'}
            onClick={setActiveTab}
          />
          <TabButton
            id="models"
            label="Models"
            icon={Package}
            isActive={activeTab === 'models'}
            onClick={setActiveTab}
          />
        </div>

        <TableExportButtons exportName={activeTab === 'categories' ? 'Categories_List' : 'Models_List'} />
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'categories' && <Categories />}
        {activeTab === 'models' && <Models />}
      </div>
    </div>
  );
};

export default Management;
