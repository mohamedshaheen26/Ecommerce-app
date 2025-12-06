import { Divider, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useTranslation } from "react-i18next";
import {
  MdClose,
  MdLogin,
  MdMenu,
  MdOutlineFavoriteBorder,
  MdOutlineShoppingCart,
  MdSearch,
} from "react-icons/md";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AccountMenu from "../components/AccountMenu";
import LanguageMenu from "../components/LanguageMenu";
import ThemeMenu from "../components/ThemeMenu";
import { useAuth } from "../context/AuthContext";

const ClientHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole, logout } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigationItems = [{ path: "/", label: "Home", icon: null }];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className='sticky top-0 z-100 bg-[var(--bg-primary)] shadow-sm border-b border-[var(--border-color)]'>
      {/* Top bar */}
      <div className='bg-[var(--bg-secondary)] border-b border-[var(--border-color)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between gap-2 h-10 text-sm'>
            <Marquee
              pauseOnHover={true}
              speed={50}
              className='gap-2'
              play={window.innerWidth < 768}
            >
              <div className='flex items-center space-x-2 text-[var(--text-muted)]'>
                <span>{t("Get 25% OFF on your first order.")}</span>
                <span>
                  <button className=' hover:text-[var(--accent-hover)] cursor-pointer'>
                    {t("Order now")}
                  </button>
                </span>
              </div>
            </Marquee>
            <div className='flex items-center gap-3'>
              <LanguageMenu />
              <Divider
                orientation='vertical'
                flexItem
                sx={{
                  borderColor: "var(--border-color)",
                  mx: 1.5,
                }}
              />
              <ThemeMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className='relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-14 sm:h-16'>
          {/* Logo - responsive sizing */}
          <div
            className='flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-fit'
            onClick={() => navigate("/")}
          >
            <img
              src='/Logo.svg'
              alt='Logo'
              className='w-8 h-8 sm:w-10 sm:h-10'
            />
            <span className='text-sm sm:text-lg font-bold transition-opacity duration-300 text-[var(--text-secondary)] hidden md:inline'>
              {t("NovaShop")}
            </span>
          </div>

          {/* Navigation - desktop view */}
          <nav className='hidden md:flex items-center space-x-4 lg:space-x-6'>
            {navigationItems.map((item) => (
              <NavLink
                to={item.path}
                key={item.path}
                className={`px-2 lg:px-3 py-2 text-sm transition-colors border-b-2 ${
                  isActive(item.path)
                    ? "text-[var(--accent-primary)] font-bold border-[var(--accent-primary)]"
                    : "text-[var(--text-secondary)] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent"
                }`}
              >
                {t(item.label)}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className='flex items-center gap-2 sm:gap-3'>
            {/* Search bar - desktop */}
            <div className='hidden xl:flex flex-1 max-w-xs'>
              <form onSubmit={handleSearch} className='w-full'>
                <div className='relative'>
                  <input
                    type='search'
                    placeholder={t("Search...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-8 pr-3 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)]'
                  />
                  <MdSearch className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                </div>
              </form>
            </div>

            {/* Mobile/Tablet search */}
            <button
              onClick={() => navigate("/search")}
              className='xl:hidden p-1.5 sm:p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition'
              aria-label='Search'
            >
              <MdSearch className='h-5 w-5 sm:h-6 sm:w-6' />
            </button>

            {/* Favorites - hidden on small screens */}
            <Tooltip arrow title={t("Favorites")} placement='bottom'>
              <button
                type='button'
                aria-label='Favorites'
                onClick={() => navigate("/favorites")}
                className='inline-flex cursor-pointer p-1.5 sm:p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition relative'
              >
                <MdOutlineFavoriteBorder className='h-5 w-5 sm:h-6 sm:w-6' />
              </button>
            </Tooltip>

            {/* Shopping cart */}
            <Tooltip arrow title={t("Cart")} placement='bottom'>
              <button
                type='button'
                aria-label='Shopping Cart'
                onClick={() => navigate("/cart")}
                className='cursor-pointer p-1.5 sm:p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition relative'
              >
                <MdOutlineShoppingCart className='h-5 w-5 sm:h-6 sm:w-6' />
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center'>
                  0
                </span>
              </button>
            </Tooltip>

            {/* Desktop user menu */}
            <div className='flex items-center gap-2'>
              {isAuthenticated ? (
                userRole === "admin" || userRole === "employee" ? (
                  <>
                    <Tooltip arrow title={t("Dashboard")} placement='bottom'>
                      <button
                        type='button'
                        aria-label='Admin Panel'
                        onClick={() => navigate("dashboard")}
                        className='hidden md:inline-flex cursor-pointer px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition'
                      >
                        {t("Dashboard")}
                      </button>
                    </Tooltip>
                    <Tooltip arrow title={t("Logout")} placement='bottom'>
                      <button
                        onClick={() => {
                          logout();
                          navigate("/");
                        }}
                        className='hidden md:inline-flex cursor-pointer px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition'
                      >
                        {t("Logout")}
                      </button>
                    </Tooltip>
                  </>
                ) : (
                  <AccountMenu />
                )
              ) : (
                <Tooltip arrow title={t("Login")} placement='bottom'>
                  <button
                    onClick={() => navigate("/login")}
                    className='hidden md:inline-flex cursor-pointer items-center space-x-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition'
                  >
                    <MdLogin className='h-3.5 w-3.5 lg:h-4 lg:w-4' />
                    <span>{t("Login")}</span>
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Mobile menu button - shown below md breakpoint */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-1.5 sm:p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition'
              aria-label='Menu'
            >
              {mobileMenuOpen ? (
                <MdClose className='h-5 w-5 sm:h-6 sm:w-6' />
              ) : (
                <MdMenu className='h-5 w-5 sm:h-6 sm:w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          style={{
            height: mobileMenuOpen
              ? mobileMenuRef.current?.scrollHeight
                ? `${mobileMenuRef.current.scrollHeight}px`
                : "auto"
              : "0px",
          }}
          className='md:hidden absolute left-0 right-0 shadow-sm border-t 
          border-[var(--border-color)] bg-[var(--bg-primary)] 
          overflow-hidden transition-all duration-300 ease-in-out'
        >
          {/* Navigation items */}
          <nav className='flex flex-col space-y-1 py-3'>
            {navigationItems.map((item) => (
              <NavLink
                to={item.path}
                key={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm transition-colors border-l-4 ${
                  isActive(item.path)
                    ? "text-[var(--accent-primary)] font-bold border-l-[var(--accent-primary)] bg-[var(--bg-secondary)]"
                    : "text-[var(--text-secondary)] font-medium hover:border-l-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] border-l-transparent"
                }`}
              >
                {t(item.label)}
              </NavLink>
            ))}
          </nav>

          {/* Mobile search bar */}
          <div className='px-4 py-2 border-t border-[var(--border-color)]'>
            <form onSubmit={handleSearch} className='w-full'>
              <div className='relative'>
                <input
                  type='search'
                  placeholder={t("Search...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-8 pr-3 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)]'
                />
                <MdSearch className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              </div>
            </form>
          </div>

          {/* Mobile user section */}
          {isAuthenticated &&
          (userRole === "admin" || userRole === "employee") ? (
            <div className='border-t border-[var(--border-color)] py-3 space-y-2'>
              <button
                type='button'
                onClick={() => {
                  navigate("dashboard");
                  setMobileMenuOpen(false);
                }}
                className='w-full text-left cursor-pointer px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition rounded'
              >
                {t("Dashboard")}
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className='w-full text-left cursor-pointer px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition rounded'
              >
                {t("Logout")}
              </button>
            </div>
          ) : (
            <div className='border-t border-[var(--border-color)] py-3'>
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className='w-full text-left cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition rounded'
              >
                <MdLogin className='h-4 w-4' />
                <span>{t("Login")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
