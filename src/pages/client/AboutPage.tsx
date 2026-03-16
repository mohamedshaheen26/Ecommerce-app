import { useTranslation } from "react-i18next";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";

const AboutPage = () => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-[var(--bg-secondary)]'>
      {/* Hero */}
      <div className='pt-32 pb-16 bg-[var(--bg-primary)] border-b border-[var(--border-color)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div
            className={`text-center ${
              currentLang === "ar" ? "lg:text-right" : "lg:text-left"
            }`}
          >
            <h1 className='text-4xl lg:text-5xl font-bold text-[var(--text-secondary)] mb-4'>
              {t("About Us")}
            </h1>
            <p className='text-lg text-[var(--text-muted)] max-w-2xl'>
              {t(
                "We are passionate about bringing you quality products and a seamless shopping experience.",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='py-16 lg:py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            <div
              className={
                currentLang === "ar" ? "lg:order-2 lg:text-right" : "lg:order-1"
              }
            >
              <h2 className='text-2xl lg:text-3xl font-bold text-[var(--text-secondary)] mb-6'>
                {t("Our Story")}
              </h2>
              <div
                className='text-[var(--text-muted)] mb-4 leading-relaxed space-y-3'
                dangerouslySetInnerHTML={{
                  __html:
                    (currentLang === "ar"
                      ? settings.about_us_ar
                      : settings.about_us) || "",
                }}
              />
              <Button
                variant='secondary'
                size='lg'
                onClick={() => navigate("/products")}
                rightIcon={
                  currentLang === "ar" ? <BsArrowLeft /> : <BsArrowRight />
                }
              >
                {t("Shop Now")}
              </Button>
            </div>
            <div className={currentLang === "ar" ? "lg:order-1" : "lg:order-2"}>
              <div className='aspect-video rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden'>
                <img
                  src='/Logo.svg'
                  alt='NovaStore'
                  className='w-32 h-32 object-contain opacity-80'
                />
              </div>
            </div>
          </div>

          {/* Values */}
          <div className='mt-24 grid sm:grid-cols-3 gap-8'>
            <div className='p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-center'>
              <h3 className='text-lg font-semibold text-[var(--text-secondary)] mb-2'>
                {t("Quality")}
              </h3>
              <p className='text-sm text-[var(--text-muted)]'>
                {t("We source and sell only products we believe in.")}
              </p>
            </div>
            <div className='p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-center'>
              <h3 className='text-lg font-semibold text-[var(--text-secondary)] mb-2'>
                {t("Trust")}
              </h3>
              <p className='text-sm text-[var(--text-muted)]'>
                {t("Secure payments and reliable delivery, every time.")}
              </p>
            </div>
            <div className='p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-center'>
              <h3 className='text-lg font-semibold text-[var(--text-secondary)] mb-2'>
                {t("Support")}
              </h3>
              <p className='text-sm text-[var(--text-muted)]'>
                {t("Our team is here to help before and after your purchase.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
