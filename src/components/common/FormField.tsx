import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface FormFieldProps {
  htmlFor: string;
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export default function FormField({
  htmlFor,
  label,
  error,
  children,
  required = false,
}: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <div className='space-y-1 mb-4'>
      <label
        htmlFor={htmlFor}
        className='block text-sm text-[var(--text-secondary)] mb-1'
      >
        {t(label)}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {children}
      {error && <p className='text-sm text-red-500'>{t(error)}</p>}
    </div>
  );
}
