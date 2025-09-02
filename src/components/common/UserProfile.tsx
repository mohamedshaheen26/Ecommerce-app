import { useState, useEffect } from "react";
import { fetchEmployeeByEmail } from "../../api/employee";
import { UserRole } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../lib/supabase";
import { Tooltip } from "@mui/material";

interface UserProfileProps {
  isDesktopOpen?: boolean;
}

interface UserInfo {
  full_name: string;
  name_ar: string;
  email: string;
  role: UserRole;
}

export default function UserProfile({ isDesktopOpen }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentLang } = useLanguage();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          if (user.email === "admin@example.com") {
            setUserInfo({
              full_name: "Super Admin",
              name_ar: "مدير عام",
              email: user.email,
              role: UserRole.Admin,
            });
          } else {
            const employeeData = await fetchEmployeeByEmail(user.email);
            if (employeeData) {
              setUserInfo(employeeData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center gap-3`}>
        <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse'></div>
        <div className='flex flex-col'>
          <div className='w-20 h-3 bg-gray-200 rounded animate-pulse'></div>
          <div className='w-16 h-2 bg-gray-200 rounded animate-pulse mt-1'></div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

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
          (currentLang === "ar" ? userInfo.name_ar : userInfo.full_name)
        }
        arrow
        placement={currentLang === "ar" ? "right" : "left"}
      >
        <div className='relative'>
          <div className='w-8 h-8 bg-gradient-to-br to-blue-500 from-[var(--accent-primary)] rounded-full flex items-center justify-center text-white font-semibold text-sm'>
            {currentLang === "ar"
              ? userInfo.name_ar.charAt(0)
              : userInfo.full_name.charAt(0).toUpperCase()}
          </div>
          <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--success)] border-2 border-[var(--border-color)] rounded-full'></div>
        </div>
      </Tooltip>
      {/* User Info */}
      {isDesktopOpen && (
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-[var(--text-secondary)]'>
            {currentLang === "ar" ? userInfo.name_ar : userInfo.full_name}
          </span>
          <span className='text-xs text-[var(--text-secondary)]'>
            {userInfo.email}
          </span>
        </div>
      )}
    </div>
  );
}
