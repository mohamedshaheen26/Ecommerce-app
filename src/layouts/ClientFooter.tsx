import { useTranslation } from "react-i18next";
import { BsGithub, BsInstagram, BsYoutube } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const ClientFooter = () => {
  const { currentTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className='pt-12 footer bg-[var(--bg-primary)] text-[var(--text-secondary)]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-wrap gap-[50px]'>
          {/* Logo & Description */}
          <div className='w-full md:w-1/4 mb-6 md:mb-0'>
            <div className='flex items-center gap-3 mb-3'>
              <img
                src='/Footer-Logo.svg'
                alt='Logo'
                className={`w-10 h-10 object-contain ${
                  currentTheme == "dark" || currentTheme == "system"
                    ? "dark:invert"
                    : ""
                }`}
              />
              <h3 className='font-bold text-lg mb-0'>{t("NovaStore")}</h3>
            </div>
            <p className='mb-10'>{t("ecommerceDescription")}</p>
            <div className='flex gap-7 text-xl'>
              <Link
                to='#'
                target='_blank'
                rel='noopener noreferrer'
                className='text-[var(--text-muted)] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
              >
                <BsGithub />
              </Link>
              <Link
                to='#'
                target='_blank'
                rel='noopener noreferrer'
                className='text-[var(--text-muted)] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
              >
                <BsInstagram />
              </Link>
              <Link
                to='#'
                target='_blank'
                rel='noopener noreferrer'
                className='text-[var(--text-muted)] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
              >
                <BsYoutube />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className='w-full md:w-5/12 flex flex-wrap'>
            <div className='w-1/3'>
              <h5 className='font-semibold text-[var(--text-muted)] mb-6'>
                {t("Support")}
              </h5>
              <ul className='space-y-5'>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("FAQ")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Terms of use")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Privacy Policy")}
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-1/3'>
              <h5 className='font-semibold text-[var(--text-muted)] mb-6'>
                {t("Company")}
              </h5>
              <ul className='space-y-5'>
                <li>
                  <Link
                    to='/about'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("About Us")}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/contact'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Contacts")}
                  </Link>
                </li>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Careers")}
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-1/3'>
              <h5 className='font-semibold text-[var(--text-muted)] mb-6'>
                {t("SHOP")}
              </h5>
              <ul className='space-y-5'>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("My Account")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Checkout")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='transition-colors border-b-2 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] border-transparent'
                  >
                    {t("Cart")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Accepted Payments */}
          <div className='w-full md:w-1/4 text-center'>
            <h5 className='font-semibold text-[var(--text-muted)] mb-6'>
              {t("ACCEPTED PAYMENTS")}
            </h5>
            <div className='flex justify-center gap-8'>
              <img
                src='/Mastercard.png'
                alt='MasterCard'
                className='h-8 object-contain filter grayscale hover:grayscale-0 transition duration-300'
              />
              <img
                src='/Amex.png'
                alt='American Express'
                className='h-8 object-contain filter grayscale hover:grayscale-0 transition duration-300'
              />
              <img
                src='/Visa.png'
                alt='Visa'
                className='h-8 object-contain filter grayscale hover:grayscale-0 transition duration-300'
              />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className='mt-20 border-t border-[var(--border-color)] text-center text-[var(--text-muted)] py-3'>
          <p>{t("© 2023 NovaStore. All rights reserved.")}</p>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;
