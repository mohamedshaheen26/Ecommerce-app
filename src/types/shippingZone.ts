export interface IShippingZone {
  id?: string;
  name: string;
  name_ar: string;
  shipping_fee: number;
  estimated_days: number;
  is_active?: boolean;
  created_at?: string;
}

export interface IShippingZoneValidation {
  name: string;
  name_ar: string;
  shipping_fee: number;
  estimated_days: number;
  is_active?: boolean;
}
