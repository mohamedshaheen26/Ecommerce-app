export interface IProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  category_id: string;
  slug: string;
  sku: string;
  stock_status: "in_stock" | "out_of_stock" | "low_stock";
  available_quantity: number;
  images: string[];
  colors: string[];
  sizes: string[];
  created_at: string;
  category: {
    name: string;
  };
}

export interface IProductFormValues {
  title: string;
  price: number;
  description: string;
  category_id: string;
  slug: string;
  sku: string;
  stock_status: "in_stock" | "out_of_stock" | "low_stock";
  available_quantity: number;
  images: File[];
  imageUrls: string[];
  colors: string[];
  sizes: string[];
}
