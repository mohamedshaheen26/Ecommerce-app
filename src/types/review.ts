export interface IProductReview {
  id: string;
  product_id?: string;
  customer_id?: string | null;
  name: string;
  comment: string;
  rating: number;
  created_at: string;
}

export type ReviewSort = "newest" | "highest" | "lowest";

export interface IProductReviewsResult {
  data: IProductReview[];
  count: number;
  averageRating: number;
}

export interface ICreateProductReviewInput {
  productId: string;
  customerId?: string | null;
  customerName: string;
  comment: string;
  rating: number;
}
