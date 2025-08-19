import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdInventory,
  MdCategory,
  MdShoppingCart,
  MdPeople,
  MdStarBorder,
  MdSettings,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

interface NavItem {
  path: string;
  title: string;
  icon: IconType;
  allowedRoles?: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    path: "/",
    title: "Dashboard",
    icon: MdDashboard,
    allowedRoles: [UserRole.Admin, UserRole.Employee],
  },
  {
    path: "/employees",
    title: "Employees",
    icon: MdPeople,
    allowedRoles: [UserRole.Admin],
  },
  {
    path: "/customers",
    title: "Customers",
    icon: MdPeople,
    allowedRoles: [UserRole.Admin],
  },
  {
    path: "/categories",
    title: "Categories",
    icon: MdCategory,
    allowedRoles: [UserRole.Admin, UserRole.Employee],
  },
  {
    path: "/products",
    title: "Products",
    icon: MdInventory,
    allowedRoles: [UserRole.Admin, UserRole.Employee],
  },
  {
    path: "/orders",
    title: "Orders",
    icon: MdShoppingCart,
    allowedRoles: [UserRole.Admin],
  },
  {
    path: "/reviews",
    title: "Reviews",
    icon: MdStarBorder,
    allowedRoles: [UserRole.Admin],
  },
  {
    path: "/settings",
    title: "Settings",
    icon: MdSettings,
    allowedRoles: [UserRole.Admin],
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
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  const isNavItemActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <div className='flex h-full flex-col border-r bg-[var(--bg-primary)] border-[var(--border-color)]'>
      {/* Sidebar header */}
      <div className='flex h-14 items-center justify-center px-4 border-b border-[var(--border-color)]'>
        <div className='flex items-center space-x-3'>
          <img src='/Logo.svg' alt='Logo' className='w-6 h-6' />
          {isDesktopOpen && (
            <span className='text-lg font-bold transition-opacity duration-300 text-[var(--text-secondary)]'>
              {t("Admin")}
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
                  ? "bg-[var(--accent-primary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]"
              }
              ${!isDesktopOpen && "justify-center px-2"}
              `
              }
              title={t(item.title)}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isDesktopOpen && currentLang === "ar"
                    ? "ml-3"
                    : !isDesktopOpen
                    ? ""
                    : "mr-3"
                }`}
              />
              {isDesktopOpen && <span>{t(item.title)}</span>}
            </NavLink>
          ))}

        {/* {userRole === UserRole.Admin && (
          <div className='mt-6 pt-6 border-t border-[var(--border-color)]'>
            <button
              className='flex items-center cursor-pointer rounded-lg px-4 py-2.5 w-full text-sm font-medium transition-colors text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]'
              onClick={() => {}}
            >
              <MdAdd
                className={`h-5 w-5 flex-shrink-0 ${
                  isDesktopOpen ? "mr-3" : ""
                }`}
              />
              {isDesktopOpen && <span>Extras</span>}
            </button>
          </div>
        )} */}
      </nav>
    </div>
  );
}
