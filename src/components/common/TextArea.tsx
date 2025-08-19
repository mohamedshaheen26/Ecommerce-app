import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      className = "",
      fullWidth = true,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <textarea
          rows={rows}
          className={`
            block p-2 rounded-md border border-[var(--border-color)]
            focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]
            disabled:cursor-not-allowed disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] text-[var(--text-secondary)]
          ${error ? "border-red-500" : ""}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
          ref={ref}
          {...props}
        />
        {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
      </div>
    );
  }
);

export default TextArea;
