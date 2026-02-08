import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useLanguage } from "../../context/LanguageContext";

const Newsletter = () => {
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className='newsletter bg-[var(--bg-secondary)] '>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-8 bg-[var(--bg-secondary)] rounded-lg py-12'>
          {/* Left column */}
          <div
            className={`flex-1 ${
              currentLang === "ar"
                ? "text-center lg:text-right"
                : "text-center lg:text-left"
            }`}
          >
            <h4 className='text-2xl lg:text-3xl font-bold mb-4 text-[var(--text-secondary)]'>
              {t("Join Our Newsletter")}
            </h4>
            <p className='mb-8 text-md text-[var(--text-muted)]'>
              {t("We love to surprise our subscribers with occasional gifts.")}
            </p>
          </div>

          {/* Right column */}
          <div className='flex-1 flex justify-end'>
            <div className='flex flex-col sm:flex-row items-center gap-3'>
              <Input
                type='email'
                placeholder={t("Your email address")}
                className='flex-1 px-4 py-3 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)] border border-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]'
              />
              <Button
                variant='secondary'
                onClick={() => console.log("Start Browsing Clicked!")}
                size='lg'
              >
                {t("Subscribe")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
