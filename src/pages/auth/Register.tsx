import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getUserRoleByEmail,
  signInWithEmailOrUsername,
  signUpWithEmailOrUsername,
} from "../../api/auth";
import FormField from "../../components/common/FormField";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useLanguage } from "../../context/LanguageContext";
import { useYupForm } from "../../hooks/useYupForm";
import {
  getRegisterSchema,
  type IRegisterValidation,
} from "../../validation/registerSchema";

const Register = () => {
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useYupForm<IRegisterValidation>(getRegisterSchema() as any, {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const message = (location.state as { message?: string })?.message;

  const onSubmit = async (data: IRegisterValidation) => {
    setError("");
    setInfoMessage("");
    
    try {
      const signUpData = await signUpWithEmailOrUsername(
        data.email,
        data.password,
        data.fullName,
        data.phone || "X00000000"
      );

      if (signUpData?.alreadyExists) {
        setInfoMessage(
          t("An account with this email already exists. Please log in.")
        );
        return;
      }

      if (signUpData?.user) {
        if (!signUpData.user.user_metadata.email_verified) {
          navigate("/emailConfirmation", {
            state: { email: signUpData.user.email },
          });
          return;
        }

        const authData = await signInWithEmailOrUsername(
          data.email,
          data.password
        );
        const token = authData.session?.access_token || "";
        const userEmail = authData.user?.email;

        if (!userEmail) {
          setError("Could not retrieve user email.");
          return;
        }

        const role = await getUserRoleByEmail(userEmail);
        await login(token, role || undefined);
        navigate("/redirect", { replace: true });
      }
    } catch (err: any) {
      setError(t("Invalid username/email or password."));
      console.error("Registration error:", err);
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
            {t("Register")}
          </h1>
        </div>

        <form className='space-y-6 mb-2' onSubmit={handleSubmit(onSubmit)}>
          {message && (
            <div className='p-3 rounded bg-green-50 text-sm text-green-700'>
              {t(message)}
            </div>
          )}
          {infoMessage && (
            <div className='p-3 rounded bg-yellow-50 text-sm text-yellow-800'>
              {t(infoMessage)}
            </div>
          )}
          {error && (
            <div className='p-3 rounded bg-red-50 text-sm text-red-700'>
              {t(error)}
            </div>
          )}

          <div className='space-y-6'>
            <FormField
              htmlFor='fullName'
              label='Full Name'
              required
              error={errors.fullName?.message}
            >
              <Input
                id='fullName'
                type='text'
                {...register("fullName")}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              htmlFor='email'
              label='Email'
              required
              error={errors.email?.message}
            >
              <Input
                id='email'
                type='email'
                {...register("email")}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              htmlFor='phone'
              label='Phone'
              error={errors.phone?.message}
            >
              <Input
                id='phone'
                type='text'
                {...register("phone")}
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
                  disabled={isSubmitting}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </FormField>
          </div>

          <Button
            fullWidth={true}
            type='submit'
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? t("Registering") : t("Register")}
          </Button>
        </form>

        <div className='text-sm text-center text-[var(--text-secondary)]'>
          {t("Already have an account?")}{" "}
          <Link
            to='/login'
            className='text-[var(--accent-primary)] hover:underline'
          >
            {t("Login")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
