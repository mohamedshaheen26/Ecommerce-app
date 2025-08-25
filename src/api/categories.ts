import { supabase } from "../lib/supabase";
import type { ICategory } from "../types";

// ✅ Get all categories
export async function fetchAllCategories(): Promise<ICategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return data || [];
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
