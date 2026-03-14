import { supabase } from "../lib/supabase";
import type { IProduct, IProductFormValues } from "../types";

const bucket_productsImg = "images";

// ✅ Fetch products with pagination and search
export async function fetchProducts(
  page: number,
  pageSize: number,
  searchQuery: string,
  categoryId?: string,
): Promise<{ data: IProduct[]; count: number }> {
  let query = supabase
    .from("products")
    .select(`*, category:category_id (name, name_ar)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `title.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,description_ar.ilike.%${searchQuery.trim()}%`,
    );
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1,
  );

  if (error) throw error;

  return { data: data || [], count: count || 0 };
}

export const uploadImages = async (files: File[]) => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket_productsImg)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(bucket_productsImg)
      .getPublicUrl(filePath);

    uploadedUrls.push(urlData.publicUrl);
  }

  return uploadedUrls;
};

// Fetch Single product
export const fetchProductById = async (
  id: string,
): Promise<IProduct | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data || null;
};

// ✅ Fetch product by slug
export async function fetchProductBySlug(
  slug: string,
): Promise<IProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:category_id (name, name_ar, path, path_ar)")
    .eq("slug", slug)
    .single();
  if (error) throw error;

  return data;
}

// ✅ Create product
export const createProduct = async (
  productData: Omit<IProductFormValues, "images"> & { images: string[] },
) => {
  const { error } = await supabase.from("products").insert([productData]);

  if (error) throw error;
};

// ✅ Update product
export const updateProduct = async (
  id: string,
  productData: Omit<IProductFormValues, "images"> & { images: string[] },
) => {
  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (error) throw error;
};

// ✅ Delete product
export async function deleteProduct(product: IProduct): Promise<void> {
  if (product.images.length > 0) {
    const imagePaths = product.images.map((url) => {
      const path = url.split("/").pop();
      return `products/${path}`;
    });

    const { error: storageError } = await supabase.storage
      .from("images")
      .remove(imagePaths);

    if (storageError) {
      console.error("Error deleting images from storage:", storageError);
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", product.id);

  if (error) throw error;
}

export async function fetchBestSellingProducts(): Promise<IProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:category_id (name, name_ar)")
    .order("sales_count", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

export async function fetchLatestProducts(): Promise<IProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:category_id (name, name_ar)")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

export async function fetchFeaturedProducts(): Promise<IProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:category_id (name, name_ar)")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

export async function fetchRelatedProducts(
  categoryId: string,
  productId: string,
): Promise<IProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:category_id (name, name_ar)")
    .eq("category_id", categoryId)
    .not("id", "eq", productId)
    .limit(10);
  if (error) throw error;
  return data || [];
}
