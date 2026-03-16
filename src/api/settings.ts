import { supabase } from "../lib/supabase";
import type { ISettings } from "../types/setting";

// ✅ Fetch settings
export async function fetchSettings(): Promise<ISettings | null> {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) throw error;
  return data || [];
}

// ✅ Update settings
export async function apiUpdateSettings(newSettings: Partial<ISettings>) {
  const { data: currentSettings, error: fetchError } = await supabase
    .from("settings")
    .select("id")
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from("settings")
    .update({
      site_name: newSettings.site_name,
      site_name_ar: newSettings.site_name_ar,
      about_us: newSettings.about_us,
      about_us_ar: newSettings.about_us_ar,
      address: newSettings.address,
      address_ar: newSettings.address_ar,
      phone_number: newSettings.phone_number,
      support_email: newSettings.support_email,
      monthly_order_goal: newSettings.monthly_order_goal,
      first_order_discount: newSettings.first_order_discount,
      free_shipping_minimum: newSettings.free_shipping_minimum,
    })
    .eq("id", currentSettings.id);

  if (updateError) throw updateError;
}
