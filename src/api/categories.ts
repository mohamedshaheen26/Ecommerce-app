import { supabase } from "../lib/supabase";
import type { ICategory } from "../types";

// ✅ Get all categories
export async function fetchAllCategories(
  page: number,
  pageSize: number,
  searchQuery: string
): Promise<{data: ICategory[]; count: number}> {
  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(`name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,description_ar.ilike.%${searchQuery.trim()}%`);
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  if (error) throw error;

  return { data: data || [], count: count || 0 };
}

// ✅ Get category by ID
export async function createCategory(categoryData: ICategory): Promise<void> {
  const { error } = await supabase.from("categories").insert([categoryData]);
  if (error) throw error;
}

// ✅ Update category
export async function updateCategory(
  id: string,
  categoryData: ICategory
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update(categoryData)
    .eq("id", id);

  if (error) throw error;
}

// ✅ Delete category by ID
export async function deleteCategoryById(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
