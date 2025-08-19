import type { SelectHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export default function Select({
  label,
  error,
  className = "",
  fullWidth = true,
  required,
  options,
  ...props
}: SelectProps) {
  const { t } = useTranslation();

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <select
        className={`
            block p-2 rounded-md border border-[var(--border-color)]
            focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]
            disabled:cursor-not-allowed disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] text-[var(--text-secondary)]
          ${error ? "border-red-500" : ""}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map(({ value, label }) => (
          <option
            key={value}
            value={value}
            className='text-[var(--text-secondary)] bg-[var(--bg-card)]'
          >
            {t(label)}
          </option>
        ))}
      </select>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
}
