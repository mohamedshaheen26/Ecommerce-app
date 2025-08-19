import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useTranslation } from "react-i18next";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]'>
      <div className='w-full max-w-md bg-[var(--bg-primary)] rounded-lg shadow-sm p-8 text-center space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-[var(--text-secondary)]'>
            {"Unauthorized"}
          </h1>
          <p className='text-[var(--text-muted)]'>
            {t("You don't have permission to view this page")}
          </p>
        </div>

        <div className='flex gap-3 justify-center'>
          <Button variant='primary' onClick={() => navigate(-1)}>
            {t("Go Back")}
          </Button>
        </div>
      </div>
    </div>
  );
}
