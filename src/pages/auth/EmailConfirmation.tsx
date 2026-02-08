import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { resendConfirmationEmail } from "../../api/auth";
import Button from "../../components/common/Button";

const EmailConfirmation = () => {
  const location = useLocation();
  const mail = location.state?.email;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const resendConfirmation = async () => {
    if (!mail) return;

    setLoading(true);
    setMessage("");

    const { success, error } = await resendConfirmationEmail(mail);

    if (success) {
      setTimeLeft(60);
      setMessage("Confirmation email sent successfully!");
    } else if (error) {
      console.error(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
      <div className='w-full max-w-[700px] bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg shadow-sm pt-8 pb-4 px-24 space-y-8 text-center'>
        <img src='/email.png' alt='Email' className='w-16 h-16 mx-auto mb-4' />
        <h1 className='text-2xl font-bold mb-4'>{t("Email Confirmation")}</h1>
        <p className='mb-2'>
          {t("We have sent mail to")}{" "}
          <strong className='text-[var(--accent-primary)]'>{mail}</strong>{" "}
          {t(
            "to confirm the validity of our email address. After receiving the emailfollow the link provided to complete your Registeration."
          )}
        </p>
        {timeLeft > 0 && message && (
          <p className='text-sm text-green-500'>{message}</p>
        )}
        {timeLeft > 0 && (
          <span>
            {t("Link expires in:")} {formatTime(timeLeft)}
          </span>
        )}
        <div className='border-t border-[var(--border-color)] mt-4 pt-2'>
          <span>{t("If you not got any mail")}</span>
          <Button
            variant='default'
            size='sm'
            onClick={resendConfirmation}
            disabled={loading || timeLeft > 0}
          >
            {loading ? "Sending..." : t("Resend Confirmation mail")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
