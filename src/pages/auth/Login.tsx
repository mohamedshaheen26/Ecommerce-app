import { Checkbox, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentUserEmail,
  getUserRoleByEmail,
  signInWithEmailOrUsername,
  signInWithFacebook,
  signInWithGoogle,
  signOut,
} from "../../api/auth";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { UserRole } from "../../types";
import { useYupForm } from "../../hooks/useYupForm";
import {
  getLoginSchema,
  type ILoginValidation,
} from "../../validation/loginSchema";

export default function Login() {
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  const message = (location.state as { message?: string })?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useYupForm<ILoginValidation>(getLoginSchema() as any, {
    usernameOrEmail: "",
    password: "",
  });

  const onSubmit = async (data: ILoginValidation) => {
    setError("");
    setLoading(true);
    try {
      const signInData = await signInWithEmailOrUsername(
        data.usernameOrEmail,
        data.password
      );

      if (signInData?.user) {
        const token = signInData.session?.access_token || "";
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
          navigate("/redirect", { replace: true });
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

        login(token, role);
        navigate("/redirect", { replace: true });
      }
    } catch (err) {
      setError("Invalid username/email or password.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
      <div className='w-full max-w-[400px] bg-[var(--bg-primary)] rounded-lg shadow-sm p-8 space-y-8'>
        <div className='flex justify-center items-center space-y-2'>
          <div className='w-8 h-8'>
            <img src='/Logo.svg' alt='Logo' className='w-full h-full' />
          </div>
          <h1 className='text-xl font-bold transition-opacity duration-300 text-[var(--text-secondary)]'>
            {t("Login")}
          </h1>
        </div>

        <form className='space-y-6 mb-2' onSubmit={handleSubmit(onSubmit)}>
          {message && (
            <div className='p-3 rounded bg-green-50 text-sm text-green-700'>
              {t(message)}
            </div>
          )}
          {error && (
            <div className='p-3 rounded bg-red-50 text-sm text-red-700'>
              {t(error)}
            </div>
          )}

          <div className='space-y-6'>
            <FormField
              htmlFor='usernameOrEmail'
              label='Username or Email'
              required
              error={errors.usernameOrEmail?.message}
            >
              <Input
                id='usernameOrEmail'
                type='text'
                {...register("usernameOrEmail")}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              htmlFor='password'
              label='Password'
              required
              error={errors.password?.message}
            >
              <div className='relative'>
                <Input
                  required={false}
                  id='password'
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isSubmitting}
                  className={`${currentLang === "ar" ? "pl-10" : "pr-10"}`}
                />
                <button
                  type='button'
                  className={`absolute inset-y-0 cursor-pointer ${
                    currentLang == "ar" ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center text-gray-500 hover:text-gray-700 focus:outline-none`}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </FormField>

            <div className='text-sm flex justify-between align-items-center text-[var(--text-secondary)]'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  sx={{
                    p: 0,
                    color: "var(--accent-primary)",
                    "&.Mui-checked": {
                      color: "var(--accent-primary)",
                    },
                    "&.MuiCheckbox-indeterminate": {
                      color: "var(--accent-primary)",
                    },
                  }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor='remember'
                  onClick={() => setRememberMe(!rememberMe)}
                  className='cursor-pointer'
                >
                  {t("Remember me")}
                </label>
              </div>
              <Link
                to='/forgot-password'
                className='text-[var(--accent-primary)] hover:underline'
              >
                {t("Forgot Password?")}
              </Link>
            </div>
          </div>

          <Button
            fullWidth={true}
            type='submit'
            disabled={loading}
            isLoading={loading}
          >
            {loading ? t("Logging") : t("Login")}
          </Button>
        </form>
        <div className='text-sm text-center text-[var(--text-secondary)]'>
          {t("Don't have an account?")}{" "}
          <Link
            to='/signup'
            className='text-[var(--accent-primary)] hover:underline'
          >
            {t("Register")}
          </Link>
        </div>
        <div className='text-sm text-center text-[var(--text-secondary)]'>
          <span>{t("Or login with:")}</span>
          <div className='flex items-center justify-center space-x-2 mt-2'>
            <Tooltip title={t("Login with Google")} arrow>
              <Button variant='outline' onClick={signInWithGoogle}>
                <img src='/google-icon.png' alt='Google' className='w-5 h-5' />
              </Button>
            </Tooltip>
            <Tooltip title={t("Login with Facebook")} arrow>
              <Button variant='outline' onClick={signInWithFacebook}>
                <img
                  src='/facebook-icon.png'
                  alt='Facebook'
                  className='w-5 h-5'
                />
              </Button>
            </Tooltip>
            {/* <Tooltip title={t("Login with Twitter")} arrow>
              <Button variant='outline' onClick={signInWithTwitter}>
                <img
                  src='/twitter-icon.png'
                  alt='Twitter'
                  className='w-5 h-5'
                />
              </Button>
            </Tooltip> */}
          </div>
        </div>
      </div>
    </div>
  );
}
