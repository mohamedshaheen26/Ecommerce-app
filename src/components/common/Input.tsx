import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Input({
  error,
  className = "",
  fullWidth = true,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  return (
    <div className={`${fullWidth ? "w-full" : ""} relative`}>
      {leftIcon && (
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500'>
          {leftIcon}
        </div>
      )}
      <input
        className={`
            block p-2 rounded-md border border-gray-300
            focus:border-blue-500 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
            ${error ? "border-red-500" : ""}
            ${fullWidth ? "w-full" : ""}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${className}
          `}
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
