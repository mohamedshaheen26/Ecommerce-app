import { supabase } from "../lib/supabase";
import type { ICoupon } from "../types";

function normalizeCouponId(id: string | number) {
  if (typeof id === "number") return id;
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export async function fetchAllCoupons(
  page?: number,
  pageSize?: number,
  searchQuery?: string,
): Promise<{ data: ICoupon[]; count: number }> {
  let query = supabase
    .from("coupons_with_status")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    const search = searchQuery.trim();
    const filters = [`code.ilike.%${search}%`];
    const numericValue = Number(search);

    if (!Number.isNaN(numericValue)) {
      filters.push(`min_order_amount.eq.${numericValue}`);
      filters.push(`max_discount_amount.eq.${numericValue}`);
      filters.push(`usage_limit.eq.${numericValue}`);
      filters.push(`usage_count.eq.${numericValue}`);
      filters.push(`starts_at.eq.${numericValue}`);
      filters.push(`expires_at.eq.${numericValue}`);
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

  return { data: (data || []) as ICoupon[], count: count || 0 };
}

export async function fetchActiveCoupons(): Promise<ICoupon[]> {
  const { data, error } = await supabase
    .from("coupons_with_status")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;

  return (data || []) as ICoupon[];
}

export const createCoupon = async (
  couponData: ICoupon,
) => {
  const { error } = await supabase
    .from("coupons")
    .insert([couponData]);

  if (error) throw error;
};

export const updateCoupon = async (
  id: string | number,
  couponData: ICoupon,
): Promise<ICoupon> => {
  const { data, error } = await supabase
    .from("coupons")
    .update(couponData)
    .eq("id", normalizeCouponId(id))
    .select("*")
    .single();

  if (error) throw error;
  return data as ICoupon;
};

export const deleteCouponById = async (id: string | number): Promise<void> => {
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", normalizeCouponId(id));
  if (error) throw error;
};
