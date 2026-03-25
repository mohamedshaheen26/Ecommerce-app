import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const period =
    typeof req.query.period === "string" ? req.query.period : "30d";

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        success: false,
        error:
          "Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables",
      });
    }

    const periodDaysMap: Record<string, number> = {
      today: 1,
      "7d": 7,
      "30d": 30,
    };
    const periodDays = periodDaysMap[period] || 30;

    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (periodDays - 1));

    const previousPeriodEndDate = new Date(startDate.getTime() - 1);
    const previousPeriodStartDate = new Date(startDate);
    previousPeriodStartDate.setDate(
      previousPeriodStartDate.getDate() - periodDays,
    );

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const [
      currentOrdersResult,
      ordersCountResult,
      previousOrdersResult,
      previousOrdersCountResult,
      currentCustomersResult,
      previousCustomersResult,
      bestSellingResult,
      recentOrdersResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id, total_amount, created_at, status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),
      supabaseAdmin
        .from("orders")
        .select("total_amount, created_at")
        .gte("created_at", previousPeriodStartDate.toISOString())
        .lte("created_at", previousPeriodEndDate.toISOString()),
      supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", previousPeriodStartDate.toISOString())
        .lte("created_at", previousPeriodEndDate.toISOString()),
      supabaseAdmin
        .from("customers")
        .select("id, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),
      supabaseAdmin
        .from("customers")
        .select("id, created_at")
        .gte("created_at", previousPeriodStartDate.toISOString())
        .lte("created_at", previousPeriodEndDate.toISOString()),
      supabaseAdmin
        .from("products")
        .select("title, name_ar, sales_count")
        .order("sales_count", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("orders")
        .select("id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (currentOrdersResult.error) throw currentOrdersResult.error;
    if (ordersCountResult.error) throw ordersCountResult.error;
    if (previousOrdersResult.error) throw previousOrdersResult.error;
    if (bestSellingResult.error) throw bestSellingResult.error;
    if (recentOrdersResult.error) throw recentOrdersResult.error;
    if (currentCustomersResult.error) throw currentCustomersResult.error;
    if (previousCustomersResult.error) throw previousCustomersResult.error;
    if (previousOrdersCountResult.error) throw previousOrdersCountResult.error;

    const currentOrders = currentOrdersResult.data || [];
    const previousOrders = previousOrdersResult.data || [];
    const currentCustomers = currentCustomersResult.data || [];
    const previousCustomers = previousCustomersResult.data || [];

    const salesPerDay = Array(periodDays).fill(0);
    currentOrders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const dayIndex = Math.floor(
        (orderDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayIndex >= 0 && dayIndex < periodDays) {
        salesPerDay[dayIndex] += order.total_amount || 0;
      }
    });

    const customersPerDay = Array(periodDays).fill(0);
    currentCustomers.forEach((customer: any) => {
      const customerDate = new Date(customer.created_at);
      const dayIndex = Math.floor(
        (customerDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayIndex >= 0 && dayIndex < periodDays) {
        customersPerDay[dayIndex] += 1;
      }
    });

    const totalSales = currentOrders.reduce(
      (sum: number, order: any) => sum + (order.total_amount || 0),
      0,
    );
    const previousPeriodSales = previousOrders.reduce(
      (sum: number, order: any) => sum + (order.total_amount || 0),
      0,
    );

    const recentOrders = (recentOrdersResult.data || []).map((order: any) => ({
      id: order.id || "Unknown Order",
      created_at: order.created_at,
      total: order.total_amount || 0,
      status: order.status,
    }));

    return res.status(200).json({
      totalSales,
      customers: currentCustomers.length,
      orders: ordersCountResult.count || 0,
      previousMonth: {
        totalSales: previousPeriodSales,
        customers: previousCustomers.length,
        orders: previousOrdersCountResult.count || 0,
      },
      bestSelling: bestSellingResult.data || [],
      recentOrders,
      salesPerDay,
      customersPerDay,
    });
  } catch (err: unknown) {
    const message =
      typeof (err as any)?.message === "string"
        ? (err as any).message
        : "Failed to fetch dashboard stats";
    console.error("dashboard-stats failed:", message, err);
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}
