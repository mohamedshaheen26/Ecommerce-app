import { supabase } from "../lib/supabase";
import type { IOrder, IOrderItem, IOrderWithUserInfo } from "../types";

// ✅ Fetch all orders with user info
export async function fetchOrders(
  page: number,
  pageSize: number,
  searchQuery: string
): Promise<{data: IOrderWithUserInfo[]; count: number}> {
  let query;
  
  if (searchQuery && searchQuery.trim()) {
    // If searching, first find customers that match the search
    const { data: matchingCustomers } = await supabase
      .from("customers")
      .select("id")
      .or(`full_name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%`);
    
    const customerIds = matchingCustomers?.map(c => c.id) || [];
    
    // Then get orders for those customers
    query = supabase
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
      .in('customer_id', customerIds.length > 0 ? customerIds : [])
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });
  } else {
    // No search, get all orders
    query = supabase
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
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  if (error) throw error;

  // Add order items for each order
  const completeOrders = await Promise.all(
    (data || []).map(async (order) => {
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

  return { data: completeOrders as unknown as IOrderWithUserInfo[], count: count || 0 };
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
