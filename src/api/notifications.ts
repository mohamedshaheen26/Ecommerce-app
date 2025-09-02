import { supabase } from "../lib/supabase";

export async function sendNotification(message: string, userId?: string) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ message, user_id: userId }]);

  if (error) {
    console.error("Notification error:", error);
  }

  return data;
}

export async function fetchNotifications(userId?: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("read", { ascending: true });
  
  if (error) {
    console.error("Fetch notifications error:", error);
    return [];
  }

  return data;
}

export async function markAllNotificationsAsRead() {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    console.error("Mark all notifications as read error:", error);
  }

  return data;
}

export async function markNotificationAsReadDB(notificationId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Mark notification as read error:", error);
  }

  return data;
}