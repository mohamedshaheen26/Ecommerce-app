import { forwardRef, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, className = "", ...props }, ref) => {
    const { t } = useTranslation();

    return (
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}
      >
        <input
          ref={ref}
          id={id}
          type='checkbox'
          className='peer sr-only'
          {...props}
        />
        <span className='relative h-6 w-11 rounded-full bg-[var(--border-color)] transition-colors duration-200 peer-checked:bg-[var(--accent-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--accent-primary)] after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5' />
        <span className='text-sm text-[var(--text-secondary)]'>{t(label)}</span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
