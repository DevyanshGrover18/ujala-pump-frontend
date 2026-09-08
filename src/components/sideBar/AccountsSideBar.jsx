import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  ShoppingCart,
  LayoutDashboard,
  Gift,
  CreditCard,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { usePendingPayoutCount } from '../../hooks/usePendingPayoutCount';
import { usePendingIncentiveCount } from '../../hooks/usePendingIncentiveCount';

const accountsSidebarItems = [
  {
    title: 'Dashboard',
    path: '/accounts-panel/dashboard',
    icon: LayoutDashboard,
    color: 'blue',
  },
  {
    title: 'Sales',
    path: '/accounts-panel/sales',
    icon: ShoppingCart,
    color: 'green',
  },
  {
    title: 'Incentives',
    path: '/accounts-panel/incentives',
    icon: Gift,
    color: 'orange',
  },
  {
    title: 'Payouts',
    path: '/accounts-panel/payouts',
    icon: CreditCard,
    color: 'purple',
  },
];

export function AccountsSideBar({ sidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { pendingCount: pendingPayoutCount } = usePendingPayoutCount();
  const { pendingCount: pendingIncentiveCount } = usePendingIncentiveCount();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out text-white ${
          sidebarOpen ? 'w-68' : 'w-16'
        }`}
        aria-label="Sidebar"
      >
        <div
          className="h-full flex flex-col px-4 pb-4 overflow-y-auto"
          style={{ background: 'var(--sidebar-bg)' }}
        >
          {/* Header */}
          <div
            className={`flex items-center h-20 ${
              sidebarOpen ? 'justify-between px-2' : 'justify-center'
            }`}
          >
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <img
                  src="/Ujala_template_logo.png"
                  alt="Ujala Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <div className="text-sm font-extrabold">Accounts</div>
                  <div className="text-xs text-white/80 -mt-1">Dashboard</div>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              type="button"
              className="p-2 text-white rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Nav Items */}
          {sidebarOpen ? (
            <ul className="mt-1 space-y-1 font-bold">
              {accountsSidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center py-1 px-3 rounded-xl group transition-all duration-200 ${
                        active ? 'bg-white' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                          active ? 'bg-white' : 'bg-white/10'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active
                              ? 'text-[var(--sidebar-bg)]'
                              : 'text-white/90'
                          }`}
                        />
                      </div>
                      <span
                        className={`ml-4 font-bold flex-1 ${
                          active ? 'text-[var(--sidebar-bg)]' : 'text-white/90'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.path === '/accounts-panel/payouts' && pendingPayoutCount > 0 && (
                        <span
                          className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                            active
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-white/20 text-white'
                          }`}
                          title={`${pendingPayoutCount} Pending Payout Request${pendingPayoutCount > 1 ? 's' : ''}`}
                        >
                          {pendingPayoutCount}
                        </span>
                      )}
                      {item.path === '/accounts-panel/incentives' && pendingIncentiveCount > 0 && (
                        <span
                          className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                            active
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-white/20 text-white'
                          }`}
                          title={`${pendingIncentiveCount} Pending Incentive Claim${pendingIncentiveCount > 1 ? 's' : ''}`}
                        >
                          {pendingIncentiveCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="mt-6 flex flex-col items-center space-y-4">
              {accountsSidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={index}>
                    <Link to={item.path} className="block relative">
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative ${
                          active ? 'bg-white sidebar-pill' : 'bg-white/10'
                        }`}
                      >
                        <Icon
                          className={`${
                            active
                              ? 'text-[var(--sidebar-bg)]'
                              : 'text-white/90'
                          } w-4 h-4`}
                        />
                        {item.path === '/accounts-panel/payouts' && pendingPayoutCount > 0 && (
                          <span
                            className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white shadow-xs"
                            title={`${pendingPayoutCount} Pending Payout Request${pendingPayoutCount > 1 ? 's' : ''}`}
                          >
                            {pendingPayoutCount > 99 ? '99+' : pendingPayoutCount}
                          </span>
                        )}
                        {item.path === '/accounts-panel/incentives' && pendingIncentiveCount > 0 && (
                          <span
                            className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white shadow-xs"
                            title={`${pendingIncentiveCount} Pending Incentive Claim${pendingIncentiveCount > 1 ? 's' : ''}`}
                          >
                            {pendingIncentiveCount > 99 ? '99+' : pendingIncentiveCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Logout */}
          <div className="mt-auto">
            <div className="mt-4">
              {sidebarOpen ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center py-2 px-3 rounded-xl group transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
                >
                  <div className="p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 bg-white/10">
                    <LogOut className="w-5 h-5 text-white/90" />
                  </div>
                  <span className="ml-4 font-bold text-white/90">Logout</span>
                </button>
              ) : (
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95"
                  >
                    <LogOut className="w-4 h-4 text-white/90" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
