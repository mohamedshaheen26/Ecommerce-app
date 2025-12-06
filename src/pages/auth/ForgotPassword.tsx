import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendResetPassword } from "../../api/auth";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import Input from "../../components/common/Input";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const sendResetLink = async () => {
    setLoading(true);
    try {
      if (email.trim() === "") {
        setError(t("Please enter a valid email address."));
        setLoading(false);
        return;
      }

      const { success, error } = await sendResetPassword(email);

      if (success) {
        setMessage(
          t("If an account with that email exists, a reset link has been sent.")
        );
      } else if (error) {
        console.error("Error sending reset link:", error);
        setError(
          t(
            "An error occurred while sending the reset link. Please try again later."
          )
        );
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      setError(
        t(
          "An error occurred while sending the reset link. Please try again later."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
      <div className='w-full max-w-[500px] bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg shadow-sm py-8 px-24 space-y-8'>
        <h1 className='text-2xl font-bold mb-4'>{t("Forgot Password")}</h1>
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
        <p className='mb-2'>
          {t(
            "Please enter the email address associated with your account. We'll promptly send you a link to reset your password."
          )}
        </p>
        <FormField htmlFor='Email' label='Email'>
          <Input
            required={false}
            id='Email'
            name='Email'
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </FormField>
        <Button
          onClick={sendResetLink}
          fullWidth
          disabled={loading}
          className='mt-2'
        >
          {loading ? t("Sending...") : t("Send Reset Link")}
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
