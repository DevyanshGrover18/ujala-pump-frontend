import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DistributorSideBar } from '../sideBar/DistributorSideBar';
import ErrorBoundary from './ErrorBoundary';

const DistributorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-full">
        <DistributorSideBar
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

export default DistributorLayout;
