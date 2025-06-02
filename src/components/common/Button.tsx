import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  fullWidth,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    // Primary - Blue (500)
    primary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
    
    // Secondary - Blue scale (B800 background with B100 hover)
    secondary: 'bg-[#0E1422] text-white hover:bg-[#333845]',
    
    // Success - Green (500)
    success: 'bg-[#22C55E] text-white hover:bg-[#16A34A]',
    
    // Danger - Red (500)
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
    
    // Warning - Yellow (500)
    warning: 'bg-[#EAB308] text-white hover:bg-[#CA8A04]',
    
    // Outline
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',

    default: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
  };

  const disabledStyles = 'opacity-50 cursor-default';
  const loadingStyles = 'relative text-transparent transition-none hover:text-transparent';
  const fullWidthStyles = 'w-full';

  const computedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ''}
    ${isLoading ? loadingStyles : ''}
    ${fullWidth ? fullWidthStyles : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`cursor-pointer ${computedClassName}`}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      <span className="flex items-center">
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </span>
    </button>
  );
} 