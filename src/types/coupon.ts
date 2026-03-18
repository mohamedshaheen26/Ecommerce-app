export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export interface ICoupon {
  id?: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  computed_is_active: boolean;
  created_at?: string;
}

export interface ICouponValidation {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  computed_is_active: boolean;
}
