import { t } from "i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "../../api/auth";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { success, error } = await updatePassword(newPassword);
      if (success) {
        logout();
        setSuccess(true);
        navigate("/login", { replace: true });
        return;
      } else if (error) {
        setError(error.message || "Failed to update password.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
      <div className='w-full max-w-[500px] bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg shadow-sm py-8 px-24 space-y-8'>
        <h1 className='text-2xl font-bold mb-4'>{t("Reset Password")}</h1>
        {error && <p className='text-red-500 mb-2'>{error}</p>}
        {success ? (
          <p className='text-green-500'>
            {t("Password updated! Redirecting to login...")}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField htmlFor='New Password' label='New Password'>
              <Input
                required={false}
                id='New Password'
                name='New Password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </FormField>
            <FormField htmlFor='Confirm Password' label='Confirm Password'>
              <Input
                required={false}
                id='Confirm Password'
                name='Confirm Password'
                type='password'
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                disabled={loading}
              />
            </FormField>
            <Button
              type='submit'
              fullWidth
              variant='secondary'
              disabled={loading}
            >
              {loading || success ? t("Updating...") : t("Update Password")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
