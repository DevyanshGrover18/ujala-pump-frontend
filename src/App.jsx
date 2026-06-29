import './App.css';
import { useContext, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/pages/Dashboard/Dashboard';
import Management from './components/pages/Management/Management';
import FactoryManagement from './components/pages/FactoryManagement/FactoryManagement';
import FactoryOrders from './components/pages/factory/factoryorder';
import FactorySales from './components/pages/factory/FactorySales';
import FactoryDashboard from './components/pages/factory/FactoryDashboard';
import DistributorDashboard from './components/pages/distributorPanel/DistributorDashboard';
import DistributorProducts from './components/pages/distributorPanel/DistributorProducts';
import DistributorDealers from './components/pages/distributorPanel/DistributorDealers';
import DistributorDealerSales from './components/pages/distributorPanel/DistributorDealerSales';
import DistributorCustomerSales from './components/pages/distributorPanel/DistributorCustomerSales';
import DealerLayout from './components/global/DealerLayout';
import DealerDashboard from './components/pages/DealersPanel/DealerDashboard';
import DealerProducts from './components/pages/DealersPanel/DealerProducts';
import DealerSubDealers from './components/pages/DealersPanel/DealerSubDealers';
import DealerSubDealerSales from './components/pages/DealersPanel/DealerSubDealerSales';
import DealerCustomerSales from './components/pages/DealersPanel/DealerCustomerSales';
import SubDealerLayout from './components/global/SubDealerLayout';
import SubDealerDashboard from './components/pages/SubDealerPanel/SubDealerDashboard';
import SubDealerProducts from './components/pages/SubDealerPanel/SubDealerProducts';
import SubDealerSales from './components/pages/SubDealerPanel/SubDealerSales';
import Orders from './components/pages/Orders/Orders';
import Products from './components/pages/Products/Products';
import ErrorBoundary from './components/global/ErrorBoundary';
import Distributors from './components/pages/Distributors/Distributors';
import Dealers from './components/pages/Dealers/Dealers';
import SubDealers from './components/pages/SubDealers/SubDealers';
import Sales from './components/pages/Sales/Sales';
import Login from './components/auth/Login';
import Notifications from './components/pages/Notifications/Notifications';
import AddMembers from './components/pages/AddMembers/index';
import Executives from './components/pages/Executives/Executives';
import Incentives from './components/pages/Incentives/Incentives';
import WalletPage from './components/pages/Wallet/WalletPage';
import Unauthorized from './components/pages/AddMembers/Unauthorized';
import ProtectedSection from './components/auth/ProtectedSection';
import { SideBar } from './components/sideBar/sideBar';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import FactoryLayout from './components/global/FactoryLayout';
import DistributorLayout from './components/global/DistributorLayout';
import ExecutiveLayout from './components/global/ExecutiveLayout';
import ExecutiveDashboard from './components/pages/ExecutivePanel/ExecutiveDashboard';
import ExecutiveDistributors from './components/pages/ExecutivePanel/ExecutiveDistributors';
import ExecutiveDealers from './components/pages/ExecutivePanel/ExecutiveDealers';
import ExecutiveSubDealers from './components/pages/ExecutivePanel/ExecutiveSubDealers';
import ExecutiveCustomers from './components/pages/ExecutivePanel/ExecutiveCustomers';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    console.log('Access denied to admin route');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  const [totalNotifications, setTotalNotifications] = useState(0);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login isAdminLoginPath={false} />} />
        <Route
          path="/login/admin"
          element={<Login isAdminLoginPath={true} />}
        />
        <Route
          path="/factory"
          element={
            <FactoryProtectedRoute>
              <FactoryLayout />
            </FactoryProtectedRoute>
          }
        >
          <Route path="dashboard" element={<FactoryDashboard />} />
          <Route path="orders" element={<FactoryOrders />} />
          <Route path="sales" element={<FactorySales />} />
        </Route>

        <Route
          path="/distributor"
          element={
            <DistributorProtectedRoute>
              <DistributorLayout />
            </DistributorProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DistributorDashboard />} />
          <Route path="products" element={<DistributorProducts />} />
          <Route path="dealers" element={<DistributorDealers />} />
          <Route path="dealer-sales" element={<DistributorDealerSales />} />
          <Route path="customer-sales" element={<DistributorCustomerSales />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        <Route
          path="/dealer"
          element={
            <DealerProtectedRoute>
              <DealerLayout />
            </DealerProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DealerDashboard />} />
          <Route path="products" element={<DealerProducts />} />
          <Route path="sub-dealers" element={<DealerSubDealers />} />
          <Route path="sub-dealer-sales" element={<DealerSubDealerSales />} />
          {/* <Route path="sub-dealer-sales1" element={<DealerSubDealerSales1 />} /> */}
          <Route path="customer-sales" element={<DealerCustomerSales />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        <Route
          path="/sub-dealer"
          element={
            <SubDealerProtectedRoute>
              <SubDealerLayout />
            </SubDealerProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SubDealerDashboard />} />
          <Route path="products" element={<SubDealerProducts />} />
          <Route path="sales" element={<SubDealerSales />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        <Route
          path="/executive"
          element={
            <ExecutiveProtectedRoute>
              <ExecutiveLayout />
            </ExecutiveProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ExecutiveDashboard />} />
          <Route path="distributors" element={<ExecutiveDistributors />} />
          <Route path="dealers" element={<ExecutiveDealers />} />
          <Route path="sub-dealers" element={<ExecutiveSubDealers />} />
          <Route path="customers" element={<ExecutiveCustomers />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout totalNotifications={totalNotifications} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="notifications"
            element={
              <Notifications setTotalNotifications={setTotalNotifications} />
            }
          />
          <Route
            path="staff"
            element={
              <AdminProtectedRoute>
                <AddMembers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="executives"
            element={
              <AdminProtectedRoute>
                <Executives />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="incentives"
            element={
              <AdminProtectedRoute>
                <Incentives />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="management"
            element={
              <ProtectedSection section="management">
                <Management />
              </ProtectedSection>
            }
          />
          <Route
            path="factory-management"
            element={
              <ProtectedSection section="factories">
                <FactoryManagement />
              </ProtectedSection>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedSection section="orders">
                <Orders />
              </ProtectedSection>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedSection section="products">
                <Products />
              </ProtectedSection>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedSection section="sales">
                <Sales />
              </ProtectedSection>
            }
          />
          {/* <Route path="sales1" element={<ProtectedSection section="sales"><Sales1 /></ProtectedSection>} /> */}
          <Route
            path="distributors"
            element={
              <ProtectedSection section="distributors">
                <Distributors />
              </ProtectedSection>
            }
          />
          <Route
            path="dealers"
            element={
              <ProtectedSection section="dealers">
                <Dealers />
              </ProtectedSection>
            }
          />
          <Route
            path="sub-dealers"
            element={
              <ProtectedSection section="subdealers">
                <SubDealers />
              </ProtectedSection>
            }
          />
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </>
  );
};

const Layout = ({ totalNotifications }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-full">
        <SideBar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          hasNotifications={totalNotifications > 0}
        />
        <div
          className={`flex-grow overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-72' : 'ml-16'}`}
        >
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
};

const FactoryProtectedRoute = ({ children }) => {
  const { isFactoryAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isFactoryAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DistributorProtectedRoute = ({ children }) => {
  const { isDistributorAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isDistributorAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const DealerProtectedRoute = ({ children }) => {
  const { isDealerAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isDealerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const SubDealerProtectedRoute = ({ children }) => {
  const { isSubDealerAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSubDealerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ExecutiveProtectedRoute = ({ children }) => {
  const { isExecutiveAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isExecutiveAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default App;
