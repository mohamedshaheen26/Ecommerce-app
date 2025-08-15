// src/services/authService.ts
import { supabase } from "../lib/supabase";
import { UserRole } from "../types";

export async function signInWithEmailOrUsername(identifier: string, password: string) {
  let email = identifier;
  const superAdminUsernames = "admin";
  const superAdminEmails = "admin@example.com";

  if (!identifier.includes("@")) {
    if (superAdminUsernames.includes(identifier.toLowerCase())) {
      email = superAdminEmails;
    } else {
      const { data, error } = await supabase
        .from("employees")
        .select("email")
        .ilike("username", identifier)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Username not found");
        }
        throw error;
      }

      if (!data?.email) {
        throw new Error("Email not found for this username");
      }

      email = data.email;
    }
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
  return authData;
}

export async function getUserRoleByEmail(email: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("role")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data?.role ?? null;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
