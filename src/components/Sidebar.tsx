import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory,
  MdCategory,
  MdShoppingCart, 
  MdPeople,
  MdStarBorder,
  MdSettings,
  MdAdd,
  MdClose
} from 'react-icons/md';

interface SidebarProps {
  isOpen?: boolean;
  isDesktopOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, isDesktopOpen = true, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200">
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black flex-shrink-0">
            <span className="text-sm font-medium text-white">
              <img src="/Logo.svg" alt="Logo" className="w-6 h-6" />
            </span>
          </div>
          {isDesktopOpen && (
            <span className="text-lg font-medium transition-opacity duration-300">Admin</span>
          )}
        </div>
        {isOpen && (
          <button
            type="button"
            className="block lg:hidden -mr-1 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <MdClose className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Dashboard"
        >
          <MdDashboard className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/dashboard/products"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Products"
        >
          <MdInventory className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Products</span>}
        </NavLink>

        <NavLink
          to="/dashboard/categories"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Categories"
        >
          <MdCategory className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Categories</span>}
        </NavLink>

        <NavLink
          to="/dashboard/orders"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Orders"
        >
          <MdShoppingCart className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Orders</span>}
        </NavLink>

        <NavLink
          to="/dashboard/customers"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Customers"
        >
          <MdPeople className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Customers</span>}
        </NavLink>

        <NavLink
          to="/dashboard/reviews"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Reviews"
        >
          <MdStarBorder className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Reviews</span>}
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            ${!isDesktopOpen && 'justify-center px-2'}
            `
          }
          title="Settings"
        >
          <MdSettings className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
          {isDesktopOpen && <span>Settings</span>}
        </NavLink>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            className={`
              flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900
              ${!isDesktopOpen && 'justify-center px-2 w-full'}
            `}
            title="Extras"
          >
            <MdAdd className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
            {isDesktopOpen && <span>Extras</span>}
          </button>
        </div>
      </nav>
    </div>
  );
} 