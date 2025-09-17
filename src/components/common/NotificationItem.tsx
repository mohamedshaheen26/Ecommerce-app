import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { BsClock, BsInfo } from "react-icons/bs";
import {
  useNotifications,
  type Notification,
} from "../../context/useNotification";
import { useLanguage } from "../../context/LanguageContext";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markNotificationAsRead } = useNotifications();
  const { currentLang } = useLanguage();

  const handleClick = () => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  return (
    <div
      className={`
        relative p-3 cursor-pointer transition-all duration-200 hover:bg-[var(--accent-light-hover)]
        ${!notification.read && "bg-[var(--accent-light)]"}
      `}
      style={{
        borderRadius: " 0 0 8px 8px",
      }}
      onClick={handleClick}
    >
      <div className='flex items-center gap-3'>
        <div className='mt-0.5'>
          <BsInfo className='h-6 w-6 text-info' />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h4
              className={`
                text-xs text-[var(--text-secondary)] truncate
                ${!notification.read && "font-semibold"}
              `}
            >
              {notification.message}
            </h4>
          </div>

          <div className='flex items-center justify-between mt-2'>
            <span className='text-xs text-muted-foreground flex items-center gap-1 text-[var(--text-muted)]'>
              <BsClock />
              {notification.created_at
                ? formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: currentLang === "ar" ? ar : undefined,
                  })
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {!notification.read && (
        <div className='absolute top-3 right-3 w-2 h-2 bg-primary rounded-full'></div>
      )}
    </div>
  );
}
