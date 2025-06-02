import type { SelectHTMLAttributes } from 'react';

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
  className = '', 
  fullWidth = true,
  required,
  options,
  ...props 
}: SelectProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          block p-2 rounded-lg border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-blue-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500' : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
} 