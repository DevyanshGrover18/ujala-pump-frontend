import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FactorySideBar } from '../sideBar/FactorySideBar';
import ErrorBoundary from './ErrorBoundary';

const FactoryLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-full">
        <FactorySideBar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div
          className={`flex-grow overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'ml-72' : 'ml-16'
          }`}
        >
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FactoryLayout;
