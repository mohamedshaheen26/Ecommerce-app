import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

interface UserProfileProps {
  isDesktopOpen?: boolean;
}

export default function UserProfile({ isDesktopOpen }: UserProfileProps) {
  const { user } = useAuth();
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center gap-3 ${
        !isDesktopOpen && "justify-center"
      }`}
    >
      {/* User Avatar */}
      <Tooltip
        title={
          !isDesktopOpen &&
          (user?.email === "admin@example.com"
            ? t("Super Admin")
            : currentLang === "ar"
              ? user?.user_metadata?.name_ar
              : user?.user_metadata?.full_name || user?.email)
        }
        arrow
        placement={currentLang === "ar" ? "right" : "left"}
      >
        <div className='relative'>
          <div className='w-8 h-8 bg-gradient-to-br to-blue-500 from-[var(--accent-primary)] rounded-full flex items-center justify-center text-white font-semibold text-sm'>
            {user?.email === "admin@example.com"
              ? t("Super Admin").charAt(0)
              : currentLang === "ar"
                ? user?.user_metadata?.name_ar?.charAt(0)
                : user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
                  user?.email}
          </div>
          <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--success)] border-2 border-[var(--border-color)] rounded-full'></div>
        </div>
      </Tooltip>
      {/* User Info */}
      {isDesktopOpen && (
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-[var(--text-secondary)]'>
            {user?.email === "admin@example.com"
              ? t("Super Admin")
              : currentLang === "ar"
                ? user?.user_metadata?.name_ar
                : user?.user_metadata?.full_name || user?.email}
          </span>
          <span className='text-xs text-[var(--text-secondary)]'>
            {user.email}
          </span>
        </div>
      )}
    </div>
  );
}
