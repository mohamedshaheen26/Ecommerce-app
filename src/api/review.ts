import { supabase } from "../lib/supabase";
import type {
  IAdminReviewsResult,
  ICreateProductReviewInput,
  IProductReview,
  IProductReviewsResult,
  IReviewAdminItem,
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

export async function fetchAllReviews(
  page: number,
  pageSize: number,
  searchQuery = "",
): Promise<IAdminReviewsResult> {
  let query = supabase
    .from("product_reviews")
    .select("id, product_id, customer_id, name, comment, rating, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (searchQuery.trim()) {
    query = query.or(
      `name.ilike.%${searchQuery.trim()}%,comment.ilike.%${searchQuery.trim()}%`,
    );
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1,
  );

  if (error) throw error;

  const reviews = (data || []) as IProductReview[];
  const productIds = Array.from(
    new Set(reviews.map((review) => review.product_id).filter(Boolean)),
  ) as string[];
  const customerIds = Array.from(
    new Set(reviews.map((review) => review.customer_id).filter(Boolean)),
  ) as string[];

  const [productsRes, customersRes] = await Promise.all([
    productIds.length
      ? supabase
          .from("products")
          .select("id, title, name_ar, slug")
          .in("id", productIds)
      : Promise.resolve({ data: [], error: null }),
    customerIds.length
      ? supabase
          .from("customers")
          .select("id, full_name, name_ar, email")
          .in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (customersRes.error) throw customersRes.error;

  const productsMap = new Map(
    (productsRes.data || []).map((product) => [product.id, product]),
  );
  const customersMap = new Map(
    (customersRes.data || []).map((customer) => [customer.id, customer]),
  );

  const mergedRows: IReviewAdminItem[] = reviews.map((review) => {
    const product = review.product_id ? productsMap.get(review.product_id) : null;
    const customer = review.customer_id
      ? customersMap.get(review.customer_id)
      : null;
    return {
      ...review,
      product_title: product?.title || "",
      product_name_ar: product?.name_ar || "",
      product_slug: product?.slug || "",
      customer_full_name: customer?.full_name || "",
      customer_name_ar: customer?.name_ar || "",
      customer_email: customer?.email || "",
    };
  });

  return { data: mergedRows, count: count || 0 };
}

export async function deleteReviewById(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId);
  if (error) throw error;
}
