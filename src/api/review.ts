import { supabase } from "../lib/supabase";
import type {
  ICreateProductReviewInput,
  IProductReview,
  IProductReviewsResult,
  ReviewSort,
} from "../types";

export async function fetchProductReviews(
  productId: string,
  page = 1,
  pageSize = 4,
  sortBy: ReviewSort = "newest",
): Promise<IProductReviewsResult> {
  let query = supabase
    .from("product_reviews")
    .select("id, product_id, customer_id, name, comment, rating, created_at", {
      count: "exact",
    })
    .eq("product_id", productId);

  if (sortBy === "highest") {
    query = query
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sortBy === "lowest") {
    query = query
      .order("rating", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const start = (page - 1) * pageSize;
  const end = page * pageSize - 1;
  const { data, error, count } = await query.range(start, end);

  if (error) throw error;

  // Keep avg rating based on all product reviews, not current page.
  const { data: ratingsRows, error: ratingsError } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId);

  if (ratingsError) throw ratingsError;
  const ratings = (ratingsRows || [])
    .map((item) => Number(item.rating))
    .filter((value) => Number.isFinite(value));
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
      : 0;

  return {
    data: (data || []) as IProductReview[],
    count: count || 0,
    averageRating,
  };
}

export async function createProductReview(
  input: ICreateProductReviewInput,
): Promise<IProductReview> {
  const { productId, customerId, customerName, comment, rating } = input;

  const normalizedRating = Math.max(1, Math.min(5, Number(rating)));
  const normalizedComment = comment.trim();
  const normalizedName = customerName.trim();

  if (!normalizedComment) {
    throw new Error("Review comment is required");
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: productId,
      customer_id: customerId ?? null,
      name: normalizedName,
      comment: normalizedComment,
      rating: normalizedRating,
    })
    .select("id, product_id, customer_id, name, comment, rating, created_at")
    .single();

  if (error) throw error;

  const createdReview = data as IProductReview;
  if (!createdReview?.id) {
    return {
      id: "",
      product_id: productId,
      customer_id: customerId ?? null,
      name: normalizedName,
      comment: normalizedComment,
      rating: normalizedRating,
      created_at: new Date().toISOString(),
    };
  }

  return createdReview;
}
