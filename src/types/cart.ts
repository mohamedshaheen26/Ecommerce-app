import type { IProduct } from "./product";

export interface ICartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  created_at: string;
  updated_at: string;
  product: IProduct | null;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  /** Optional product snapshot for guest cart (when not authenticated) */
  product?: IProduct | null;
}
