export interface IDashboardStats {
  totalSales: number;
  customers: number;
  orders: number;
  bestSelling: IBestSellingProduct[];
  recentOrders: IRecentOrder[];
}

export interface IBestSellingProduct {
  title: string;
  sales_count: number;
}

export interface IRecentOrder {
  id: string;
  created_at: string;
  total: number;
  status: "Processing" | "Completed";
}