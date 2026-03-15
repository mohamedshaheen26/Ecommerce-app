import { supabase } from "../lib/supabase";
import type { ICategory } from "../types";

const CATEGORY_PATH_SEPARATOR = " / ";

function buildCategoryPaths(categories: ICategory[]): ICategory[] {
  const categoryMap = new Map<string, ICategory>();

  categories.forEach((category) => {
    if (category.id) {
      categoryMap.set(category.id, category);
    }
  });

  const pathCache = new Map<string, { path: string; path_ar: string }>();

  const resolvePath = (
    category: ICategory,
    stack = new Set<string>(),
  ): { path: string; path_ar: string } => {
    if (!category.id) {
      return { path: category.name, path_ar: category.name_ar };
    }

    const cached = pathCache.get(category.id);
    if (cached) return cached;

    // Prevent infinite loops if bad parent references exist.
    if (stack.has(category.id)) {
      return { path: category.name, path_ar: category.name_ar };
    }

    stack.add(category.id);

    const parent =
      category.parent_id && categoryMap.has(category.parent_id)
        ? categoryMap.get(category.parent_id)
        : null;

    const ownPath = { path: category.name, path_ar: category.name_ar };

    if (!parent) {
      pathCache.set(category.id, ownPath);
      stack.delete(category.id);
      return ownPath;
    }

    const parentPath = resolvePath(parent, stack);
    const resolved = {
      path: `${parentPath.path}${CATEGORY_PATH_SEPARATOR}${category.name}`,
      path_ar: `${parentPath.path_ar}${CATEGORY_PATH_SEPARATOR}${category.name_ar}`,
    };

    pathCache.set(category.id, resolved);
    stack.delete(category.id);

    return resolved;
  };

  return categories.map((category) => {
    const resolvedPath = resolvePath(category);
    return {
      ...category,
      path: resolvedPath.path,
      path_ar: resolvedPath.path_ar,
    };
  });
}

async function syncCategoryPathsToDb(): Promise<void> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, name_ar, parent_id, path, path_ar");

  if (error) throw error;

  const source = (data || []) as ICategory[];
  const categoriesWithPath = buildCategoryPaths(source);

  const updates = categoriesWithPath
    .filter((category) => category.id)
    .filter(
      (category) =>
        category.path !==
          source.find((item) => item.id === category.id)?.path ||
        category.path_ar !==
          source.find((item) => item.id === category.id)?.path_ar,
    )
    .map((category) =>
      supabase
        .from("categories")
        .update({ path: category.path, path_ar: category.path_ar })
        .eq("id", category.id!),
    );

  if (updates.length === 0) return;

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

// ✅ Get all categories
export async function fetchAllCategories(
  page?: number,
  pageSize?: number,
  searchQuery?: string,
): Promise<{ data: ICategory[]; count: number }> {
  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,description_ar.ilike.%${searchQuery.trim()}%`,
    );
  }

  const hasPagination =
    typeof page === "number" &&
    page > 0 &&
    typeof pageSize === "number" &&
    pageSize > 0;

  const { data, error, count } = hasPagination
    ? await query.range((page - 1) * pageSize, page * pageSize - 1)
    : await query;

  if (error) throw error;

  const categoriesWithPath = buildCategoryPaths(data || []);

  return { data: categoriesWithPath, count: count || 0 };
}

// ✅ Get category by ID
export async function fetchCategoryById(id: string): Promise<ICategory | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCategory(categoryData: ICategory): Promise<void> {
  const { error } = await supabase.from("categories").insert([categoryData]);
  if (error) throw error;

  await syncCategoryPathsToDb();
}

// ✅ Update category
export async function updateCategory(
  id: string,
  categoryData: ICategory,
): Promise<void> {
  debugger;
  const { error } = await supabase
    .from("categories")
    .update(categoryData)
    .eq("id", id);

  if (error) throw error;

  await syncCategoryPathsToDb();
}

// ✅ Delete category by ID
export async function deleteCategoryById(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;

  await syncCategoryPathsToDb();
}
