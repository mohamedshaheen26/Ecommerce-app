import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import {
  getCurrentUserEmail,
  getUserRoleByEmail,
  signInWithEmailOrUsername,
  signOut,
} from "../../api/login";
import { UserRole } from "../../types";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state, or default to '/dashboard'
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  // Show success message from signup if it exists
  const message = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signInWithEmailOrUsername(usernameOrEmail, password);

      if (data?.user) {
        const token = data.session?.access_token || "";
        const email = await getCurrentUserEmail();

        if (!email) {
          setError("Could not retrieve user email.");
          setLoading(false);
          return;
        }

        const superAdmins: string = "admin@example.com";
        const isSuper: boolean = !!superAdmins
          ?.split(",")
          .map((e: string) => e.trim().toLowerCase())
          .includes(email.toLowerCase());

        if (isSuper) {
          login(token, UserRole.Admin);
          navigate(from, { replace: true });
          return;
        }

        const role = await getUserRoleByEmail(email);

        if (!role) {
          await signOut();
          setError(
            "Your account does not have a role assigned. Contact admin."
          );
          setLoading(false);
          return;
        }

        login(token);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError("Invalid username/email or password.");
      console.error("Login error:", err);
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
              <FormField htmlFor='usernameOrEmail' label='Username or Email'>
                <Input
                  required={false}
                  id='usernameOrEmail'
                  name='usernameOrEmail'
                  type='text'
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading}
                />
              </FormField>
            </div>

            <div className='space-y-1'>
              <FormField htmlFor='password' label='Password'>
                <Input
                  required={false}
                  id='password'
                  name='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </FormField>
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
