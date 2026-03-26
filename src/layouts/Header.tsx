import { Badge, Popover, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsBell } from "react-icons/bs";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import {
  MdDarkMode,
  MdLanguage,
  MdLightMode,
  MdLogout,
  MdMenu,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import BreadcrumbsComponents from "../components/Breadcrumbs";
import Button from "../components/common/Button";
import { NotificationItem } from "../components/common/NotificationItem";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/useNotification";
interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { currentLang, changeLanguage } = useLanguage();
  const { notifications, markAllAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <header className='sticky top-0 z-10 shadow-2xs bg-[var(--bg-primary)]'>
      <div className='flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onToggleSidebar}
            className='lg:hidden -ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg'
          >
            <span className='sr-only'>Open sidebar</span>
            <MdMenu className='h-6 w-6' />
          </button>

          <BreadcrumbsComponents path={location.pathname} className='!mb-0' />
        </div>

        <div className='flex items-center gap-4'>
          <Tooltip arrow title={t("Go to Store")} placement='bottom'>
            <button
              type='button'
              aria-label='Store'
              onClick={() => navigate("/")}
              className='cursor-pointer flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg'
            >
              {t("Store")}
            </button>
          </Tooltip>

          <Tooltip title={t("Notifications")} arrow>
            <Button
              onClick={handleClick}
              variant='outline'
              size='sm'
              className=' border-none'
            >
              <Badge badgeContent={unreadCount} color='error'>
                <BsBell className='h-5 w-5' />
              </Badge>
            </Button>
          </Tooltip>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            transformOrigin={{
              vertical: "top",
              horizontal: currentLang === "ar" ? "left" : "right",
            }}
            sx={{
              ".MuiPaper-root": {
                top: "55px !important",
                left:
                  currentLang === "ar" ? "200px !important" : "auto !important",
                right:
                  currentLang === "ar" ? "auto !important" : "200px !important",
                backgroundColor: "var(--bg-secondary)",
                width: "300px",
                maxWidth: "100%",
                maxHeight: "400px",
                overflow: "unset",
                display: "flex",
                flexDirection: "column",
                borderRadius: "8px",
                boxShadow: "var(--shadow)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-8px",
                  left: currentLang === "ar" ? "26px" : "258px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  transform: "rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
          >
            <div className='flex items-center justify-between p-4 pb-2 border-b border-[var(--border-color)]'>
              <div className=''>
                <h3 className='font-semibold text-[var(--text-secondary)]'>
                  {t("Notifications")}
                </h3>
                <p className='text-[var(--text-muted)] text-sm'>
                  {t("unreadMessages", { count: unreadCount })}
                </p>
              </div>
              {unreadCount > 0 && (
                <Tooltip title={`${t("Mark all as read")}`} arrow>
                  <Button
                    variant='outline'
                    className='border-none hover:bg-[var(--accent-hover)] !p-1 !rounded-full !min-h-[auto] !w-7 !h-7'
                  >
                    <LiaCheckDoubleSolid
                      className='h-5 w-5'
                      onClick={markAllAsRead}
                    />
                  </Button>
                </Tooltip>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className='p-8 text-center text-[var(--text-muted)]'>
                <BsBell className='h-12 w-12 mx-auto mb-4 opacity-20' />
                <p className='text-sm'>{t("No notifications")}</p>
              </div>
            ) : (
              <div className='overflow-y-auto flex-1'>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`
                      ${
                        index < notifications.length - 1
                          ? "border-b border-[var(--border-color)]"
                          : ""
                      }`}
                  >
                    <NotificationItem notification={notification} />
                  </div>
                ))}
              </div>
            )}
          </Popover>

          <Tooltip
            title={
              currentLang === "en"
                ? t("Change to Arabic")
                : t("Change to English")
            }
            arrow
          >
            <Button
              variant='outline'
              onClick={() => changeLanguage(currentLang === "en" ? "ar" : "en")}
              size='sm'
              className=' border-none'
            >
              <MdLanguage className='h-5 w-5' />
            </Button>
          </Tooltip>

          <Tooltip title={`${t("Change Theme")}`} arrow>
            <Button
              variant='outline'
              onClick={toggleTheme}
              size='sm'
              className=' border-none'
            >
              {darkMode ? (
                <MdLightMode className='h-5 w-5' />
              ) : (
                <MdDarkMode className='h-5 w-5' />
              )}
            </Button>
          </Tooltip>

          <Tooltip title={`${t("Logout")}`} arrow>
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
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Header;
