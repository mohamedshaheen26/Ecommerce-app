export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface IOrder {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  created_at: string;
  user_email: string;
  user_full_name: string;
  order_items: IOrderItem[];
}

export interface IOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

export interface IOrderItemResponse {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

export interface IOrderResponse {
  id: string;
  user_id: string;
  status: IOrder['status'];
  total_amount: number;
  shipping_address: string;
  created_at: string;
}