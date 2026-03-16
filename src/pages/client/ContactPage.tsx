import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useLanguage } from "../../context/LanguageContext";

const ContactPage = () => {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
              {t("Contacts")}
            </h1>
            <p className='text-lg text-[var(--text-muted)] max-w-2xl'>
              {t("Get in touch. We'd love to hear from you.")}
            </p>
          </div>
        </div>
      </div>

      <div className='py-16 lg:py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16'>
            {/* Contact info */}
            <div
              className={
                currentLang === "ar" ? "lg:order-2 lg:text-right" : "lg:order-1"
              }
            >
              <h2 className='text-2xl font-bold text-[var(--text-secondary)] mb-6'>
                {t("Contact Information")}
              </h2>
              <ul className='space-y-6'>
                <li className='flex items-start gap-4'>
                  <span className='flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]'>
                    <MdLocationOn className='w-5 h-5' />
                  </span>
                  <div>
                    <p className='font-medium text-[var(--text-secondary)]'>
                      {t("Address")}
                    </p>
                    <p className='text-[var(--text-muted)]'>
                      123 Commerce Street, City, Country
                    </p>
                  </div>
                </li>
                <li className='flex items-start gap-4'>
                  <span className='flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]'>
                    <MdEmail className='w-5 h-5' />
                  </span>
                  <div>
                    <p className='font-medium text-[var(--text-secondary)]'>
                      {t("Email")}
                    </p>
                    <a
                      href='mailto:support@NovaStore.com'
                      className='text-[var(--text-muted)] hover:text-[var(--accent-primary)]'
                    >
                      support@NovaStore.com
                    </a>
                  </div>
                </li>
                <li className='flex items-start gap-4'>
                  <span className='flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]'>
                    <MdPhone className='w-5 h-5' />
                  </span>
                  <div>
                    <p className='font-medium text-[var(--text-secondary)]'>
                      {t("Phone")}
                    </p>
                    <p className='text-[var(--text-muted)]'>
                      +1 (555) 123-4567
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Form */}
            <div className={currentLang === "ar" ? "lg:order-1" : "lg:order-2"}>
              <div className='p-6 lg:p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]'>
                <h2 className='text-2xl font-bold text-[var(--text-secondary)] mb-6'>
                  {t("Send us a message")}
                </h2>
                {submitted ? (
                  <p className='text-[var(--accent-primary)] font-medium py-4'>
                    {t("Thank you! Your message has been sent.")}
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-4'>
                    <Input
                      type='text'
                      name='name'
                      placeholder={t("Your name")}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className='px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)]'
                    />
                    <Input
                      type='email'
                      name='email'
                      placeholder={t("Your email address")}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className='px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)]'
                    />
                    <Input
                      type='text'
                      name='subject'
                      placeholder={t("Subject")}
                      value={formData.subject}
                      onChange={handleChange}
                      className='px-4 py-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)]'
                    />
                    <textarea
                      name='message'
                      placeholder={t("Your message")}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className='w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] resize-none'
                    />
                    <Button type='submit' variant='secondary' size='lg'>
                      {t("Send message")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
