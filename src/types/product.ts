export enum StockStatus {
  IN_STOCK = "in_stock",
  OUT_OF_STOCK = "out_of_stock",
  LOW_STOCK = "low_stock",
}

export interface IProduct {
  id: string;
  title: string;
  name_ar: string;
  price: number;
  description: string;
  description_ar: string;
  category_id: string;
  stock_status: StockStatus;
  available_quantity: number;
  images: string[];
  colors: string[];
  sizes: string[];
  created_at: string;
  category: {
    name: string;
    name_ar: string;
  };
}

export interface IProductFormValues {
  title: string;
  name_ar: string;
  price: number;
  description: string;
  description_ar: string;
  category_id: string;
  stock_status: StockStatus | "";
  available_quantity: number;
  images: string[];
  colors: string[];
  sizes: string[];
}


export interface IProductValidation {
  title: string;
  name_ar: string;
  price: number;
  description: string;
  description_ar: string;
  category_id: string;
  stock_status: StockStatus | "";
  available_quantity: number;
  images: string[];
  colors: string[];
  sizes: string[];
}