import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdChevronLeft, MdChevronRight, MdLogout } from 'react-icons/md';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Generate breadcrumbs from current location
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      path: '/' + paths.slice(0, index + 1).join('/')
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 bg-white transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopSidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        <Sidebar 
          isOpen={isSidebarOpen}
          isDesktopOpen={isDesktopSidebarOpen}
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Desktop toggle button */}
        <button
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className="hidden lg:flex absolute -right-4 top-20 h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50"
        >
          {isDesktopSidebarOpen ? (
            <MdChevronLeft className="h-5 w-5 text-gray-600" />
          ) : (
            <MdChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left section with menu button and breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden -ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <span className="sr-only">Open sidebar</span>
                <MdMenu className="h-6 w-6" />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-2">
                {breadcrumbs.map((item, index) => (
                  <div key={item.path} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-gray-400">/</span>
                    )}
                    <span className={`
                      text-sm font-medium
                      ${index === breadcrumbs.length - 1 
                        ? 'text-gray-800' 
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right section with logout button */}
            <div>
              <Button
                variant="default"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-none"
              >
                <MdLogout className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 