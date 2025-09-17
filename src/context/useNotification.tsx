import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsReadDB,
} from "../api/notifications";
import { supabase } from "../lib/supabase";

export interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  markAllAsRead: () => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotificationsOnce = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const data = await fetchNotifications(user.id);
        setNotifications(data);

        const channel = supabase
          .channel("public:notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`, // ✅ فلترة باليوزر
            },
            (payload) => {
              setNotifications((prev) => [
                payload.new as Notification,
                ...prev,
              ]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    loadNotificationsOnce();
  }, []);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead();
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    await markNotificationAsReadDB(notificationId);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markAllAsRead,
        markNotificationAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  return context;
};
