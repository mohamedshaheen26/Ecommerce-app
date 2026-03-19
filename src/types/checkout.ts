export interface ICheckout {
  id?: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  shippingZone: string;
  email: string;
  orderNotes: string;
  created_at?: string;
}

export interface ICheckoutFormValidation {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  shippingZone: string;
  email: string;
  orderNotes: string;
}

