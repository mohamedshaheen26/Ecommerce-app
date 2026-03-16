import type { ICustomer } from "./user";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface IOrder {
  id: string;
  customer_id: string;
  shipping_zone_id?: string | null;
  customer: ICustomer;
  shipping_zone?: {
    id?: string;
    name: string;
    name_ar: string;
    shipping_fee: number;
    estimated_days: number;
  } | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: IOrderItem[];
}


export interface IOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    name_ar: string;
    image_url: string;
  };
}

export interface IOrderWithUserInfo extends IOrder {
  customer: ICustomer & {
    phone: string;
    full_name: string;
    name_ar: string;
  };
}