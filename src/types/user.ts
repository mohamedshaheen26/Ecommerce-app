import type { IOrder } from "./order";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  role: UserRole;
}

export interface ICustomerWithStats extends IUser {
  orders: IOrder[];
  total_orders: number;
  total_spent: number;
}
