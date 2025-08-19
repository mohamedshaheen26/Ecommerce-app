import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import {
  MdMenu,
  MdLogout,
  MdLightMode,
  MdDarkMode,
  MdLanguage,
} from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";
import { getBreadcrumbs } from "../utils/getBreadcrumbs";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const breadcrumbs = getBreadcrumbs();
  const { darkMode, toggleTheme } = useTheme();
  const { currentLang, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className='sticky top-0 z-10 shadow-2xs bg-[var(--bg-primary)]'>
      <div className='flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Left section with menu button and breadcrumbs */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onToggleSidebar}
            className='lg:hidden -ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg'
          >
            <span className='sr-only'>Open sidebar</span>
            <MdMenu className='h-6 w-6' />
          </button>

          {/* Breadcrumbs */}
          <nav className='hidden sm:flex items-center gap-2'>
            {breadcrumbs.map((item, index) => (
              <div key={item.path} className='flex items-center'>
                {index > 0 && <span className='mx-2 text-gray-400'>/</span>}
                <span
                  className={`
                      text-sm font-medium
                      ${
                        index === breadcrumbs.length - 1
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-secondary)] hover:text-gray-700"
                      }
                    `}
                >
                  {t(item.name)}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right section with theme toggle and logout button */}
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            onClick={() => changeLanguage(currentLang === "en" ? "ar" : "en")}
            size='sm'
            className=' border-none'
            title={
              currentLang === "en" ? "Change to Arabic" : "Change to English"
            }
          >
            <MdLanguage className='h-5 w-5' />
          </Button>

          <Button
            variant='outline'
            onClick={toggleTheme}
            size='sm'
            className=' border-none'
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <MdLightMode className='h-5 w-5' />
            ) : (
              <MdDarkMode className='h-5 w-5' />
            )}
          </Button>

          <Button
            variant='outline'
            onClick={handleLogout}
            size='sm'
            className='border-none'
          >
            {currentLang === "ar" ? (
              <MdLogout className='h-5 w-5 rotate-180' />
            ) : (
              <MdLogout className='h-5 w-5' />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
