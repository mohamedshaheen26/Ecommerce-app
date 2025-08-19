import type { ButtonHTMLAttributes, ReactNode } from "react";
import Loader from "./Loader";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loadingText?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  fullWidth,
  type = "button",
  loadingText,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200 cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[48px]",
  };

  const variantStyles = {
    // Primary - Blue (500)
    primary:
      "bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)]",

    // Secondary - Blue scale (B800 background with B100 hover)
    secondary: "bg-[#0E1422] text-white hover:bg-[#333845]",

    // Success - Green (500)
    success: "bg-[#22C55E] text-white hover:bg-[#16A34A]",

    // Danger - Red (500)
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]",

    // Warning - Yellow (500)
    warning: "bg-[#EAB308] text-white hover:bg-[#CA8A04]",

    // Outline
    outline:
      "border border-gray-300 text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]",
  };

  const disabledStyles =
    "disabled:opacity-50 disabled:cursor-default disabled:bg-transparent disabled:text-[var(--text-muted)]";
  const fullWidthStyles = "w-full";

  const computedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ""}
    ${fullWidth ? fullWidthStyles : ""}
    ${className}
  `.trim();

  // const Loader = () => (
  //   <svg
  //     className='animate-spin -ml-1 mr-2 h-4 w-4'
  //     xmlns='http://www.w3.org/2000/svg'
  //     fill='none'
  //     viewBox='0 0 24 24'
  //   >
  //     <circle
  //       className='opacity-25'
  //       cx='12'
  //       cy='12'
  //       r='10'
  //       stroke='currentColor'
  //       strokeWidth='4'
  //     />
  //     <path
  //       className='opacity-75'
  //       fill='currentColor'
  //       d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
  //     />
  //   </svg>
  // );

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={computedClassName}
      {...props}
    >
      <div className='flex items-center gap-1'>
        {isLoading && <Loader />}
        {leftIcon && !isLoading && (
          <span className='mr-2 flex-shrink-0'>{leftIcon}</span>
        )}
        <span>{isLoading && loadingText ? loadingText : children}</span>
        {rightIcon && !isLoading && (
          <span className='ml-2 flex-shrink-0'>{rightIcon}</span>
        )}
      </div>
    </button>
  );
}
