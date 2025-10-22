import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--bg-primary)]'>
      <div className='text-center'>
        <div className='mb-8'>
          <div className='text-9xl font-bold text-[var(--accent-primary)] mb-4'>
            404
          </div>
          <div className='w-32 h-32 mx-auto mb-6'>
            <svg
              viewBox='0 0 200 200'
              className='w-full h-full text-[var(--text-muted)]'
              fill='currentColor'
            >
              <circle
                cx='100'
                cy='100'
                r='80'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                opacity='0.3'
              />
              <circle
                cx='100'
                cy='100'
                r='60'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                opacity='0.5'
              />
              <circle
                cx='100'
                cy='100'
                r='40'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                opacity='0.7'
              />
              <circle
                cx='100'
                cy='100'
                r='20'
                fill='currentColor'
                opacity='0.8'
              />
            </svg>
          </div>
        </div>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-[var(--text-primary)] mb-4'>
            {t("Page Not Found")}
          </h1>
          <p className='text-lg text-[var(--text-secondary)] mb-2'>
            {t("Sorry, the page you are looking for doesn't exist.")}
          </p>
          <p className='text-sm text-[var(--text-muted)]'>
            {t(
              "The page might have been moved, deleted, or you entered the wrong URL."
            )}
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button
            variant='primary'
            onClick={() => navigate(-1)}
            className='px-6 py-3'
          >
            {t("Go Back")}
          </Button>
          <Button
            variant='outline'
            onClick={() => navigate("/")}
            className='px-6 py-3'
          >
            {t("Go Home")}
          </Button>
        </div>
      </div>
    </div>
  );
}
