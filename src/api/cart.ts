import { supabase } from "../lib/supabase";
import type { AddToCartInput, ICartItem } from "../types";

const CART_SELECT = `
  id,
  user_id,
  product_id,
  quantity,
  selected_color,
  selected_size,
  created_at,
  updated_at,
  product:product_id (*, category:category_id (name, name_ar, path, path_ar))
`;

const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user?.id) throw new Error("AUTH_REQUIRED");

  return user.id;
};

const withVariantFilters = (
  query: any,
  selectedColor?: string | null,
  selectedSize?: string | null,
) => {
  if (selectedColor?.trim()) {
    query = query.eq("selected_color", selectedColor.trim());
  } else {
    query = query.is("selected_color", null);
  }

  if (selectedSize?.trim()) {
    query = query.eq("selected_size", selectedSize.trim());
  } else {
    query = query.is("selected_size", null);
  }

  return query;
};

export async function fetchCartItems(): Promise<ICartItem[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    product: Array.isArray(item.product)
      ? (item.product[0] ?? null)
      : item.product,
  })) as ICartItem[];
}

export async function fetchCartCount(): Promise<number> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);

  if (error) throw error;
  return (data || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export async function addToCart({
  productId,
  quantity,
  selectedColor,
  selectedSize,
}: AddToCartInput): Promise<void> {
  if (quantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const userId = await getCurrentUserId();

  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId);

  existingQuery = withVariantFilters(
    existingQuery,
    selectedColor,
    selectedSize,
  );

  const { data: existingItem, error: existingError } =
    await existingQuery.maybeSingle();

  if (existingError) throw existingError;

  if (existingItem?.id) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase.from("cart_items").insert({
    user_id: userId,
    product_id: productId,
    quantity,
    selected_color: selectedColor?.trim() || null,
    selected_size: selectedSize?.trim() || null,
  });

  if (insertError) throw insertError;
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<void> {
  if (quantity < 1) {
    await removeCartItem(cartItemId);
    return;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function clearCart(): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
