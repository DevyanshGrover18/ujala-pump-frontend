import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Building,
  Package,
  Users,
  Truck,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  ChevronDown,
  Gift,
  RefreshCw,
  Banknote,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationIcon from '../global/NotificationIcon';
import { usePendingPayoutCount } from '../../hooks/usePendingPayoutCount';
import { usePendingIncentiveCount } from '../../hooks/usePendingIncentiveCount';

const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    color: 'blue',
  },
  {
    title: 'Management',
    path: '/management',
    icon: Settings,
    color: 'indigo',
  },
  {
    title: 'Factories',
    icon: Building,
    color: 'green',
    children: [
      {
        title: 'Factory Management',
        path: '/factory-management',
      },
      {
        title: 'Orders',
        path: '/orders',
      },
    ],
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Package,
    color: 'yellow',
  },
  {
    title: 'Sales',
    path: '/sales',
    icon: ShoppingCart,
    color: 'green',
  },
  {
    title: 'Staff',
    path: '/staff',
    icon: Users,
    color: 'orange',
  },
  {
    title: 'Executives',
    path: '/executives',
    icon: Users,
    color: 'pink',
  },
  {
    title: 'Distributors',
    path: '/distributors',
    icon: Users,
    color: 'purple',
  },
  {
    title: 'Dealers',
    path: '/dealers',
    icon: Truck,
    color: 'red',
  },
  {
    title: 'Sub Dealers',
    path: '/sub-dealers',
    icon: Users,
    color: 'teal',
  },
  {
    title: 'Plumbers',
    path: '/plumbers',
    icon: Users,
    color: 'indigo',
  },
  {
    title: 'Accounts Team',
    path: '/accounts',
    icon: Users,
    color: 'sky',
  },
  {
    title: 'Incentives',
    path: '/incentives',
    icon: Gift,
    color: 'amber',
  },
  {
    title: 'Payouts',
    path: '/payouts',
    icon: Banknote,
    color: 'emerald',
  },
  {
    title: 'Replacements',
    path: '/replacements',
    icon: RefreshCw,
    color: 'teal',
  },
];

export function SideBar({ sidebarOpen, toggleSidebar, totalNotifications }) {
  const [factoryDropdownOpen, setFactoryDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPrivilege, hasAnyPrivilege, isAdmin } =
    useContext(AuthContext);
  const { pendingCount: pendingPayoutCount } = usePendingPayoutCount();
  const { pendingCount: pendingIncentiveCount } = usePendingIncentiveCount();

  const pathToSection = {
    '/management': 'management',
    '/factory-management': 'factories',
    '/orders': 'orders',
    '/inventory': 'products',
    '/replacements': 'products',
    '/distributors': 'distributors',
    '/dealers': 'dealers',
    '/sub-dealers': 'subDealers',
    '/plumbers': 'plumbers',
    '/add-members': 'management',
    '/sales': 'sales',
    '/staff': 'management',
    '/executives': 'management',
  };

  const canAccessSection = (section) => {
    if (isAdmin) return true;
    if (!section) return false;
    return hasAnyPrivilege(section);
  };

  const isItemVisible = (item) => {
    if (item.path === '/') return true;
    if (item.title === 'Staff' && !isAdmin) return false;
    if (item.path === '/executives' && !isAdmin) return false;
    if (item.path === '/incentives' && !isAdmin) return false;
    if (item.path === '/payouts' && !isAdmin) return false;
    if (item.path === '/accounts' && !isAdmin) return false;
    if (item.path === '/add-members') return isAdmin;

    if (item.children) {
      return item.children.some((child) => {
        const section = pathToSection[child.path] || null;
        return canAccessSection(section);
      });
    }

    const section = pathToSection[item.path] || null;
    return canAccessSection(section);
  };

  useEffect(() => {
    if (!sidebarOpen) {
      setFactoryDropdownOpen(false);
    }
  }, [sidebarOpen]);

  const isActive = (path) => location.pathname === path;
  const isChildActive = (children) =>
    children.some((child) => isActive(child.path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out text-white ${
          // <-- CHANGED Z-40 to Z-50
          sidebarOpen ? 'w-68' : 'w-16'
        }`}
        aria-label="Sidebar"
      >
        <div
          className="h-full flex flex-col px-4 pb-4 overflow-y-auto"
          style={{ background: 'var(--sidebar-bg)' }}
        >
          {/* Sidebar Header */}
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
                  <div className="text-sm font-extrabold">Admin</div>
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

          {/* Sidebar Items */}
          {sidebarOpen ? (
            <ul className="mt-1 space-y-1 font-bold">
              {sidebarItems.filter(isItemVisible).map((item, index) => {
                const Icon = item.icon;

                if (item.children) {
                  const active = isChildActive(item.children);
                  return (
                    <li key={index}>
                      <button
                        onClick={() =>
                          setFactoryDropdownOpen(!factoryDropdownOpen)
                        }
                        type="button"
                        className={`flex items-center w-full py-1 px-3 rounded-xl group transition-all duration-200 font-bold ${
                          active ? 'bg-white sidebar-pill' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
                            active
                              ? 'bg-[var(--primary-purple)]'
                              : 'bg-white/10'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${active ? 'text-white' : 'text-white/90'}`}
                          />
                        </div>
                        <span
                          className={`flex-1 ml-4 text-left font-bold ${
                            active
                              ? 'text-[var(--sidebar-bg)]'
                              : 'text-white/90'
                          }`}
                        >
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            factoryDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {factoryDropdownOpen && (
                        <ul className="pl-11 mt-2 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <Link
                                to={child.path}
                                className={`block py-1 px-3 rounded-md text-sm ${
                                  isActive(child.path)
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/80 hover:bg-white/10'
                                }`}
                              >
                                • {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center py-1 px-3 rounded-xl group transition-all duration-200 ${
                        isActive(item.path) ? 'bg-white' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                          isActive(item.path) ? 'bg-white' : 'bg-white/10'
                        }`}
                      >
                        {item.showIcon ? (
                          <NotificationIcon count={totalNotifications} />
                        ) : (
                          <Icon
                            className={`w-5 h-5 ${
                              isActive(item.path)
                                ? 'text-[var(--sidebar-bg)]'
                                : 'text-white/90'
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`ml-4 font-bold flex-1 ${
                          isActive(item.path)
                            ? 'text-[var(--sidebar-bg)]'
                            : 'text-white/90'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.path === '/payouts' && pendingPayoutCount > 0 && (
                        <span
                          className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                            isActive(item.path)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-white/20 text-white'
                          }`}
                          title={`${pendingPayoutCount} Pending Payout Request${pendingPayoutCount > 1 ? 's' : ''}`}
                        >
                          {pendingPayoutCount}
                        </span>
                      )}
                      {item.path === '/incentives' &&
                        pendingIncentiveCount > 0 && (
                          <span
                            className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                              isActive(item.path)
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
            <ul className="mt-6 flex flex-col items-center space-y-2">
              {sidebarItems.filter(isItemVisible).map((item, index) => {
                const Icon = item.icon;
                const active = item.children
                  ? isChildActive(item.children)
                  : isActive(item.path);
                return (
                  <li key={index}>
                    {item.children ? (
                      <button
                        onClick={() => {
                          if (!sidebarOpen) toggleSidebar();
                          setFactoryDropdownOpen(!factoryDropdownOpen);
                        }}
                        className="block"
                      >
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
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
                        </div>
                      </button>
                    ) : (
                      <Link to={item.path} className="block relative">
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative ${
                            active ? 'bg-white sidebar-pill' : 'bg-white/10'
                          }`}
                        >
                          {item.showIcon ? (
                            <NotificationIcon count={totalNotifications} />
                          ) : (
                            <Icon
                              className={`${
                                active
                                  ? 'text-[var(--sidebar-bg)]'
                                  : 'text-white/90'
                              } w-4 h-4`}
                            />
                          )}
                          {item.path === '/payouts' &&
                            pendingPayoutCount > 0 && (
                              <span
                                className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white shadow-xs"
                                title={`${pendingPayoutCount} Pending Payout Request${pendingPayoutCount > 1 ? 's' : ''}`}
                              >
                                {pendingPayoutCount > 99
                                  ? '99+'
                                  : pendingPayoutCount}
                              </span>
                            )}
                          {item.path === '/incentives' &&
                            pendingIncentiveCount > 0 && (
                              <span
                                className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white shadow-xs"
                                title={`${pendingIncentiveCount} Pending Incentive Claim${pendingIncentiveCount > 1 ? 's' : ''}`}
                              >
                                {pendingIncentiveCount > 99
                                  ? '99+'
                                  : pendingIncentiveCount}
                              </span>
                            )}
                        </div>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* User Info & Logout */}
          <div className="mt-auto flex items-center justify-center">
            {sidebarOpen ? (
              <div className="flex items-center space-x-2">
                {user?.role === 'admin' && (
                  <Link
                    to="/notifications"
                    className={`p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                      isActive('/notifications')
                        ? 'bg-[var(--primary-purple)]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={
                        isActive('/notifications')
                          ? 'text-white'
                          : 'text-white/90'
                      }
                    >
                      <NotificationIcon count={totalNotifications} />
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 bg-white/10"
                >
                  <LogOut className="w-5 h-5 text-white/90" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                {user?.role === 'admin' && (
                  <Link
                    to="/notifications"
                    className="flex items-center justify-center"
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                        isActive('/notifications')
                          ? 'bg-white sidebar-pill'
                          : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={
                          isActive('/notifications')
                            ? 'text-[var(--sidebar-bg)]'
                            : 'text-white/90'
                        }
                      >
                        <NotificationIcon count={totalNotifications} />
                      </div>
                    </div>
                  </Link>
                )}
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
      </aside>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden" // <-- CHANGED Z-30 to Z-40
        ></div>
      )}
    </>
  );
}
