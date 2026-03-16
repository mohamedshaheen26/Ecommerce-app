import { supabase } from "../lib/supabase";
import type { IShippingZone } from "../types";

export async function fetchAllShippingZones(
  page?: number,
  pageSize?: number,
  searchQuery?: string,
): Promise<{ data: IShippingZone[]; count: number }> {
  let query = supabase
    .from("shipping_zones")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    const search = searchQuery.trim();
    const filters = [`name.ilike.%${search}%`, `name_ar.ilike.%${search}%`];
    const numericValue = Number(search);

    if (!Number.isNaN(numericValue)) {
      filters.push(`shipping_fee.eq.${numericValue}`);
      if (Number.isInteger(numericValue)) {
        filters.push(`estimated_days.eq.${numericValue}`);
      }
    }

    query = query.or(filters.join(","));
  }

  const hasPagination =
    typeof page === "number" &&
    page > 0 &&
    typeof pageSize === "number" &&
    pageSize > 0;

  const { data, error, count } = hasPagination
    ? await query.range((page - 1) * pageSize, page * pageSize - 1)
    : await query;

  if (error) throw error;

  return { data: (data || []) as IShippingZone[], count: count || 0 };
}

export async function createShippingZone(
  shippingZoneData: IShippingZone,
): Promise<void> {
  const { error } = await supabase
    .from("shipping_zones")
    .insert([shippingZoneData]);
  if (error) throw error;
}

export async function fetchActiveShippingZones(): Promise<IShippingZone[]> {
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;

  return (data || []) as IShippingZone[];
}

export async function updateShippingZone(
  id: string,
  shippingZoneData: IShippingZone,
): Promise<void> {
  const { error } = await supabase
    .from("shipping_zones")
    .update(shippingZoneData)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteShippingZoneById(id: string): Promise<void> {
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) throw error;
}
