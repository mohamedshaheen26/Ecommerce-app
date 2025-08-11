import { supabase } from "../lib/supabase"

// ✅ Get all employees
export async function fetchAllEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ✅ Get employee by ID
export async function fetchEmployeeById(id: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ✅ Create Employee
export async function createEmployee(employee: any) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: employee.email,
    password: employee.password,
  });

  if (authError) throw authError;

  const { error } = await supabase
    .from('employees')
    .insert({
      full_name: employee.full_name,
      email: employee.email,
      username: employee.username,
      user_id: authData.user?.id,
      phone: employee.phone,
      address: employee.address,
      role: employee.role,
      hire_date: employee.hire_date,
      salary: employee.salary,
    });

  if (error) throw error;
}

// ✅ Update Employee
export async function updateEmployee(id: string, employee: any) {
  const { error } = await supabase
    .from('employees')
    .update(
      {
        full_name: employee.full_name,
        username: employee.username,
        phone: employee.phone,
        address: employee.address,
        role: employee.role,
        hire_date: employee.hire_date,
        salary: employee.salary,
      }
    )
    .eq('id', id)
  if (error) throw error  
}

// ✅ Delete Employee
export async function deleteEmployeeById(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
  if (error) throw error
}