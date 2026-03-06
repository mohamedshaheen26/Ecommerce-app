import { supabase } from "../lib/supabase";
import type { IEmployee } from "../types";

// ✅ Get all employees
export async function fetchAllEmployees(
  page: number,
  pageSize: number,
  searchQuery: string,
): Promise<{ data: IEmployee[]; count: number }> {
  let query = supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchQuery && searchQuery.trim()) {
    query = query.or(
      `full_name.ilike.%${searchQuery.trim()}%,name_ar.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%,username.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%`,
    );
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1,
  );

  if (error) throw error;

  return { data: data || [], count: count || 0 };
}

// ✅ Get employee by ID
export async function fetchEmployeeById(id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ✅ Get employee by USER_ID
export async function fetchEmployeeByUserId(user_id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user_id)
    .single();
  if (error) throw error;
  return data;
}

// ✅ Get employee by email
export async function fetchEmployeeByEmail(email: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("full_name, name_ar, email, role")
    .eq("email", email)
    .single();
  if (error) throw error;
  return data;
}

// ✅ Create Employee
export async function createEmployee(employee: any) {
  debugger; 
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: employee.email,
    password: employee.password,
  });

  if (authError) throw authError;

  const { error } = await supabase.from("employees").insert({
    full_name: employee.full_name,
    name_ar: employee.name_ar,
    email: employee.email,
    username: employee.username,
    user_id: authData.user?.id,
    phone: employee.phone,
    address: employee.address,
    address_ar: employee.address_ar,
    role: employee.role,
    hire_date: employee.hire_date,
    salary: employee.salary,
  });

  if (error) throw error;
}

// ✅ Update Employee
export async function updateEmployee(id: string, employee: any) {
  const { error } = await supabase
    .from("employees")
    .update({
      full_name: employee.full_name,
      name_ar: employee.name_ar,
      username: employee.username,
      phone: employee.phone,
      address: employee.address,
      address_ar: employee.address_ar,
      role: employee.role,
      hire_date: employee.hire_date,
      salary: employee.salary,
    })
    .eq("id", id);
  if (error) throw error;
}

// ✅ Change Password
export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error changing password:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

// ✅ Admin Change Password
export async function adminChangePassword(userId: string, newPassword: string) {
  const response = await fetch("api/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Unknown error");

  return data;
}

// ✅ Delete Employee
export async function deleteEmployeeById(userId: string) {
  const response = await fetch("api/delete-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Unknown error");

  return data;
}
