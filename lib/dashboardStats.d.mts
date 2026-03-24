import type { SupabaseClient } from "@supabase/supabase-js";

export function getDashboardStatsPayload(
  supabaseAdmin: SupabaseClient,
  period: string,
): Promise<{
  totalSales: number;
  customers: number;
  orders: number;
  previousMonth: {
    totalSales: number;
    customers: number;
    orders: number;
  };
  bestSelling: Array<{
    title: string;
    name_ar: string;
    sales_count: number;
  }>;
  recentOrders: Array<{
    id: string;
    created_at: string | null;
    total: number;
    status: string;
  }>;
  salesPerDay: number[];
  customersPerDay: number[];
}>;
