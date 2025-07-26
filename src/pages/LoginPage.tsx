import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state, or default to '/dashboard'
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Show success message from signup if it exists
  const message = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Look up user by username or email
      const { data: userData, error: lookupError } = await supabase
        .from("users")
        .select("email")
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
        .single();

      if (lookupError || !userData) {
        throw new Error("Username or email not found");
      }

      // Sign in using found email and provided password
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: userData.email,
          password,
        });

      if (signInError) throw signInError;

      if (data?.user) {
        const userId = data.user.id;

        const { data: roleData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (roleError || !roleData) {
          throw new Error("Could not fetch user role");
        }

        const token = data.session?.access_token || "";

        login(token, roleData.role);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-[400px] bg-white rounded-lg shadow-sm p-8 space-y-8'>
        <div className='flex justify-center items-center space-y-2'>
          <div className='w-8 h-8'>
            <img src='/Logo.svg' alt='Logo' className='w-full h-full' />
          </div>
          <h1 className='text-xl font-bold text-gray-900'>Admin</h1>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit}>
          {message && (
            <div className='p-3 rounded bg-green-50 text-sm text-green-700'>
              {message}
            </div>
          )}
          {error && (
            <div className='p-3 rounded bg-red-50 text-sm text-red-700'>
              {error}
            </div>
          )}

          <div className='space-y-6'>
            <div className='space-y-1'>
              <Input
                label='Username or Email'
                required={false}
                id='usernameOrEmail'
                name='usernameOrEmail'
                type='text'
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className='space-y-1'>
              <Input
                label='Password'
                required={false}
                id='password'
                name='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#111827] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
