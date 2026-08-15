import { t } from "i18next";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import type { IOrder, IOrderItem, IOrderWithUserInfo } from "../types";

// 🛠️ Helper: build the base order select
const ORDER_SELECT = `
  id,
  customer_id,
  shipping_zone_id,

  customer: customers (
    full_name,
    name_ar,
    phone,
    address,
    address_ar
  ),

  shipping_zone: shipping_zones (
    id,
    name,
    name_ar,
    shipping_fee,
    estimated_days
  ),

  status,

  subtotal_amount,
  discount_amount,
  shipping_amount,
  tax_amount,
  total_amount,

  coupon_id,

  shipping_address,
  created_at,
  updated_at,
  notes
`;

// 🛠️ Helper: fetch items for one order
export async function fetchOrderItemsByOrderId(
  orderId: string,
): Promise<IOrderItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      product_id,
      quantity,
      price,
      product:products(title, name_ar, image_url)
    `,
    )
    .eq("order_id", orderId);

  if (error) {
    console.error("Error fetching order items:", error);
    return [];
  }

  return (data || []) as unknown as IOrderItem[];
}

export async function fetchOrderById(
  orderId: string,
): Promise<IOrderWithUserInfo | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  if (!data) return null;

  const order_items = await fetchOrderItemsByOrderId(orderId);

  return {
    ...data,
    order_items,
  } as unknown as IOrderWithUserInfo;
}

// ✅ Fetch all orders
export async function fetchOrders(
  page: number,
  pageSize: number,
  searchQuery: string,
): Promise<{ data: IOrderWithUserInfo[]; count: number }> {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery.trim()) {
    const { data: matchingCustomers, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .or(
        `full_name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`,
      );

    if (customerError) throw customerError;

    const customerIds = matchingCustomers?.map((c) => c.id) || [];

    if (customerIds.length === 0) {
      return { data: [], count: 0 };
    }

    query = query.in("customer_id", customerIds);
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1,
  );

  if (error) throw error;

  const completeOrders = await Promise.all(
    (data || []).map(async (order) => ({
      ...order,
      order_items: await fetchOrderItemsByOrderId(order.id),
    })),
  );

  return {
    data: completeOrders as unknown as IOrderWithUserInfo[],
    count: count || 0,
  };
}

// ✅ Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: IOrder["status"],
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) throw error;
}

type CreateOrderItemInput = {
  product_id: string;
  quantity: number;
};

type CreateOrderInput = {
  customer_id: string;
  shipping_zone_id: string;
  shipping_address: string;
  total_amount: number;
  notes?: string | null;
  status?: IOrder["status"];
  items: CreateOrderItemInput[];
  coupon_id?: string | null;
};

export type CheckoutCalculation = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};


export async function createOrder(input: CreateOrderInput) {
  try {
    const { error, data } = await supabase.rpc("create_order", {
      p_customer_id: input.customer_id,
      p_shipping_zone_id: input.shipping_zone_id,
      p_shipping_address: input.shipping_address,
      p_total_amount: input.total_amount,
      p_notes: input.notes,
      p_items: input.items,
      p_coupon_id: input.coupon_id,
    });

    if (error) {
      console.error("Failed to create order:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to create order:", error);
    toast.error(t("Failed to create order"));
    return;
  }
}

export async function calculateCheckout(input: {
  customer_id: string;
  shipping_zone_id: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  coupon_id?: string | null;
}): Promise<CheckoutCalculation> {
  const { data, error } = await supabase.rpc("calculate_checkout", {
    p_customer_id: input.customer_id,
    p_shipping_zone_id: input.shipping_zone_id,
    p_items: input.items,
    p_coupon_id: input.coupon_id ?? null,
  });

  if (error) {
    console.error("Failed to calculate checkout:", error);
    throw error;
  }

  return {
    subtotal: Number(data.subtotal || 0),
    discount: Number(data.discount || 0),
    shipping: Number(data.shipping || 0),
    tax: Number(data.tax || 0),
    total: Number(data.total || 0),
  };
}