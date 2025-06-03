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
import type { IconType } from 'react-icons';

interface NavItem {
  path: string;
  title: string;
  icon: IconType;
}

const navigationItems: NavItem[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: MdDashboard,
  },
  {
    path: '/dashboard/products',
    title: 'Products',
    icon: MdInventory,
  },
  {
    path: '/dashboard/categories',
    title: 'Categories',
    icon: MdCategory,
  },
  {
    path: '/dashboard/orders',
    title: 'Orders',
    icon: MdShoppingCart,
  },
  {
    path: '/dashboard/customers',
    title: 'Customers',
    icon: MdPeople,
  },
  {
    path: '/dashboard/reviews',
    title: 'Reviews',
    icon: MdStarBorder,
  },
  {
    path: '/dashboard/settings',
    title: 'Settings',
    icon: MdSettings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  isDesktopOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, isDesktopOpen = true, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200">
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-center px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/Logo.svg" alt="Logo" className="w-6 h-6" />
          {isDesktopOpen && (
            <span className="text-lg font-bold transition-opacity duration-300">Admin</span>
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
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
              ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              ${!isDesktopOpen && 'justify-center px-2'}
              `
            }
            title={item.title}
          >
            <item.icon className={`h-5 w-5 flex-shrink-0 ${isDesktopOpen ? 'mr-3' : ''}`} />
            {isDesktopOpen && <span>{item.title}</span>}
          </NavLink>
        ))}

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