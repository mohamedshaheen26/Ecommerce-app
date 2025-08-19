import { supabase } from "../lib/supabase";
import type { IBestSellingProduct, IRecentOrder } from "../types/dashboard";

export async function getTotalSalesCurrentMonth(): Promise<number> {
  const { data, error } = await supabase
    .from("orders")
    .select("total_amount")
    .gte("created_at", new Date(new Date().setDate(1)).toISOString());

  if (error) throw error;

  return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
}

export async function getCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count || 0;
}

export async function getOrderCountCurrentMonth(): Promise<number> {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setDate(1)).toISOString());

  if (error) throw error;

  return count || 0;
}

export async function getBestSellingProducts(limit = 3): Promise<IBestSellingProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("title, name_ar, sales_count")
    .order("sales_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function getRecentOrders(limit = 5): Promise<IRecentOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total_amount,
        created_at
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (
    data?.map((order) => ({
      id: order.id || "Unknown Order",
      created_at: order.created_at,
      total: order.total_amount,
      status: order.status,
    })) || []
  );
}
