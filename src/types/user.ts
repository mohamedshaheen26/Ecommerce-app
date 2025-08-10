import type { IOrder } from "./order";

export enum UserRole {
  Admin = "admin",
  Employee = "employee",
  User = "user",
}

export interface IUser {
  id?: string;
  role: UserRole;
  full_name: string;
  email: string;
  username: string | null;
  password: string | null;
  confirm_password: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

export interface IEmployee extends IUser {
  salary?: number | null;
  hire_date: Date | null | string;
}

export interface IEmployeeValidation {
  full_name: string;
  email: string;
  username: string;
  password?: string;
  confirm_password?: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  salary?: number | null;
  hire_date: Date | null | string;
}

export interface ICustomer extends IUser {
  orders: IOrder[];
  total_orders: number;
  total_spent: number;
}