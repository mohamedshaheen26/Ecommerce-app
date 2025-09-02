import type { OrderStatus } from "./order";

export interface IDashboardStats {
  totalSales: number;
  customers: number;
  orders: number;
  bestSelling: IBestSellingProduct[];
  recentOrders: IRecentOrder[];
  salesPerDay?: number[];
  customersPerDay?: number[];
}

export interface IBestSellingProduct {
  title: string;
  name_ar: string;
  sales_count: number;
}

export interface IRecentOrder {
  id: string;
  created_at: string;
  total: number;
  status: OrderStatus;
}