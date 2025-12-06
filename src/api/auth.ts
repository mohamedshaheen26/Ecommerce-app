// src/services/authService.ts
import { supabase } from "../lib/supabase";
import { UserRole } from "../types";

interface SignUpExisting {
  alreadyExists: true;
  user: any;
}

interface SignUpNew {
  user: any | null;
  session?: any | null;
  alreadyExists?: false;
}


export async function signUpWithEmailOrUsername(identifier: string, password: string, fullName: string, phone: string): Promise<SignUpExisting | SignUpNew> {
  debugger
  let email = identifier;

  const { data: existingUser } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();

    if (existingUser) {
      return {
        alreadyExists: true,
        user: existingUser,
      };
    }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone }
    }
  });

  if (error) throw error;

  return data;
}

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
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("role")
    .eq("email", email)
    .single();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("role")
    .eq("email", email)
    .single();

  if (employeeError && employeeError.code !== "PGRST116") throw employeeError;
  if (customerError && customerError.code !== "PGRST116") throw customerError;

  return employee?.role || customer?.role || null;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email: email});

  if (error) {
    console.error('Error resending confirmation email:', error.message);
    return { success: false, error };
  }

  return { success: true };
}

export async function sendResetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error('Error Reset Password:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function checkUserStatus() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return null;
  if (!user.confirmed_at) return false;

  return true;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw error;
  return data;
}

export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
  });
  if (error) throw error;
  return data;
}

export async function signInWithTwitter() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
  });
  if (error) throw error;
  return data;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
