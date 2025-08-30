import { supabase } from "../lib/supabase";
import type { ICustomer, IOrder } from "../types";

// ✅ Get all customers
export async function fetchAllCustomers(
  page: number,
  pageSize: number,
  searchQuery: string
): Promise<{data: ICustomer[]; count: number}> {
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(`full_name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%`);
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  if (error) throw error;

  return { data: data, count: count ?? 0 };
}

// ✅ Get all customers With orders
export async function fetchAllCustomersWithOrders(
  page: number,
  pageSize: number,
  searchQuery: string
): Promise<{data:ICustomer[]; count: number}> {
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(`full_name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%`);
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  if (error) throw error;

  const customers: ICustomer[] = [];

  for (const customer of data) {
    const orders = await fetchCustomerOrders(customer.id);
    const total_orders = orders.length;
    const total_spent = orders.reduce(
      (sum: number, order: IOrder) => sum + (order.total_amount || 0),
      0
    );

    customers.push({
      ...customer,
      orders,
      total_orders,
      total_spent,
    });
  }

  return { data: customers, count: count ?? 0 };
}

// ✅ Get customer by ID with orders
export async function fetchCustomerWithOrders(id: string): Promise<ICustomer | null> {
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (customerError) throw customerError;
  if (!customerData) return null;

  const orders = await fetchCustomerOrders(id);
  const total_orders = orders.length;
  const total_spent = orders.reduce(
    (sum: number, order: IOrder) => sum + (order.total_amount || 0),
    0
  );

  return {
    ...customerData,
    orders,
    total_orders,
    total_spent,
  };
}

// ✅ Helper: Get orders for one customer
export async function fetchCustomerOrders(customerId: string): Promise<IOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId);

  if (error) throw error;
  return data || [];
}

// ✅ Create customer
export async function createCustomer(customerData: Omit<ICustomer, "orders" | "total_orders" | "total_spent">): Promise<void> {
  const { error } = await supabase.from("customers").insert([customerData]);
  if (error) throw error;
}

// ✅ Update customer
export async function updateCustomer(id: string, customerData: Partial<ICustomer>): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", id);
  if (error) throw error;
}

// ✅ Delete customer
export async function deleteCustomerById(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}
