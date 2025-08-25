import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { error, className = "", fullWidth = true, leftIcon, rightIcon, ...props },
    ref
  ) => {
    return (
      <div className={`relative`}>
      <div className={`${fullWidth ? "w-full" : ""} relative`}>
        {leftIcon && (
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500'>
            {leftIcon}
          </div>
        )}
        <input
          className={`
            block p-2 rounded-md border border-[var(--border-color)]
            focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]
            disabled:cursor-not-allowed disabled:bg-[var(--disabled-input)] disabled:text-[var(--text-muted)] text-[var(--text-secondary)]
            ${error ? "border-red-500" : ""}
            ${fullWidth ? "w-full" : ""}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500'>
            {rightIcon}
          </div>
        )}
        {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
      </div>
    );
  }
);

export default Input;
