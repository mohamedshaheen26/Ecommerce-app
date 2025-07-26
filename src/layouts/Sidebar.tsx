import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdInventory,
  MdCategory,
  MdShoppingCart,
  MdPeople,
  MdStarBorder,
  MdSettings,
  MdAdd,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

interface NavItem {
  path: string;
  title: string;
  icon: IconType;
  allowedRoles?: string[];
}

const navigationItems: NavItem[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: MdDashboard,
    allowedRoles: ["admin", "user"],
  },
  {
    path: "/dashboard/products",
    title: "Products",
    icon: MdInventory,
    allowedRoles: ["admin", "user"],
  },
  {
    path: "/dashboard/categories",
    title: "Categories",
    icon: MdCategory,
    allowedRoles: ["admin", "user"],
  },
  {
    path: "/dashboard/orders",
    title: "Orders",
    icon: MdShoppingCart,
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/customers",
    title: "Customers",
    icon: MdPeople,
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/reviews",
    title: "Reviews",
    icon: MdStarBorder,
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/settings",
    title: "Settings",
    icon: MdSettings,
    allowedRoles: ["admin"],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  isDesktopOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isDesktopOpen = true,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const { userRole } = useAuth();

  // Function to determine if a nav item should be active
  const isNavItemActive = (path: string) => {
    // Dashboard link should be active for exactly /dashboard
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    // Other links should match their paths exactly
    return location.pathname === path;
  };

  return (
    <div className='flex h-full flex-col border-r border-gray-200'>
      {/* Sidebar header */}
      <div className='flex h-16 items-center justify-center px-4 border-b border-gray-200'>
        <div className='flex items-center space-x-3'>
          <img src='/Logo.svg' alt='Logo' className='w-6 h-6' />
          {isDesktopOpen && (
            <span className='text-lg font-bold transition-opacity duration-300'>
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 overflow-y-auto p-4'>
        {navigationItems
          .filter(
            (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={() =>
                `flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
              ${
                isNavItemActive(item.path)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
              ${!isDesktopOpen && "justify-center px-2"}
              `
              }
              title={item.title}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isDesktopOpen ? "mr-3" : ""
                }`}
              />
              {isDesktopOpen && <span>{item.title}</span>}
            </NavLink>
          ))}

        {userRole === "admin" && (
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <Button
              fullWidth={true}
              variant='outline'
              className='border-none justify-start'
              onClick={() => {}}
              leftIcon={
                <MdAdd
                  className={`h-5 w-5 flex-shrink-0 ${
                    isDesktopOpen ? "mr-3" : ""
                  }`}
                />
              }
            >
              {isDesktopOpen && <span>Extras</span>}
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
}
