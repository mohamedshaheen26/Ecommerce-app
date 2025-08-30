import { supabase } from "../lib/supabase";

export async function bulkDelete(domainName: string, ids: number[]) {
  debugger
  const { data, error } = await supabase
    .from(domainName)
    .delete()
    .in("id", ids); 

  if (error) {
    console.error("Bulk delete error:", error.message);
    throw error;
  }

  return data;
}
