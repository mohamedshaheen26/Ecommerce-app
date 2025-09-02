import { supabase } from "../lib/supabase";
import type { IBestSellingProduct, IRecentOrder } from "../types/dashboard";

export async function getTotalSalesCurrentMonth(): Promise<number> {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const lastDayOfMonth = new Date(firstDayOfMonth);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setDate(0);
  lastDayOfMonth.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, status")
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString());

  if (error) throw error;

  const totalSales = data?.reduce((sum, order) => {
    if (order.status === "delivered") {
      return sum + order.total_amount;
    }
    return sum;
  }, 0) || 0;

  return totalSales;
}

export async function getSalesPerDayCurrentMonth(): Promise<number[]> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (error) throw error;

  const daysInMonth = endOfMonth.getDate();
  const salesPerDay = Array(daysInMonth).fill(0);

  data.forEach((order) => {
    const day = new Date(order.created_at).getDate();
    salesPerDay[day - 1] += order.total_amount;
  });

  return salesPerDay;
}

export async function getCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count || 0;
}

export async function getCustomerPerDayCurrentMonth(): Promise<number[]> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const { data, error } = await supabase
    .from("customers")
    .select("created_at")
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (error) throw error;

  const daysInMonth = endOfMonth.getDate();
  const employeesPerDay = Array(daysInMonth).fill(0);

  data.forEach((employee) => {
    const day = new Date(employee.created_at).getDate();
    employeesPerDay[day - 1] += 1;
  });

  return employeesPerDay;
}

export async function getOrderCountCurrentMonth(): Promise<number> {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const lastDayOfMonth = new Date(firstDayOfMonth);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setDate(0);
  lastDayOfMonth.setHours(23, 59, 59, 999);

  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString());

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

export async function getRecentOrders(limit = 6): Promise<IRecentOrder[]> {
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
