import { supabase } from "../lib/supabase";

export async function sendNotification(
  message: string,
  orderId?: string,
) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      message,
      order_id: orderId ?? null,
      user_id: null,
    });

  if (error) {
    throw error;
  }
}

export async function fetchNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
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