import { supabase } from "../lib/supabase";
import type { IOrder, IOrderItem, IOrderWithUserInfo } from "../types";

// ✅ Fetch all orders with user info
export async function fetchOrders(): Promise<IOrderWithUserInfo[]> {
  // Get all orders basic info
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
        `
        id,
        customer_id,
        customer: customers (
          full_name,
          name_ar,
          phone,
          address,
          address_ar
        ),
        status,
        total_amount,
        shipping_address,
        created_at,
        updated_at,
        notes
    `
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (ordersError) throw ordersError;

  // Add order items for each order
  const completeOrders = await Promise.all(
    (ordersData || []).map(async (order) => {
      const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        quantity,
        price,
        product: products (
          title,
          name_ar,
          image_url
        )
      `)
      .eq("order_id", order.id);
    

      if (itemsError || !itemsData) {
        console.error("Error fetching order items:", itemsError);
        return {
          ...order,
          order_items: [],
        };
      }

      return {
        ...order,
        order_items: itemsData as unknown as IOrderItem[],
      };
    })
  );

  return completeOrders as unknown as IOrderWithUserInfo[];
}

// ✅ Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: IOrder["status"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) throw error;
}
