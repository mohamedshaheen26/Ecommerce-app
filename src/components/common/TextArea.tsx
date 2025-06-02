import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function TextArea({ 
  label, 
  error, 
  className = '', 
  fullWidth = true,
  required,
  rows = 4,
  ...props 
}: TextAreaProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          block p-2 rounded-lg border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-blue-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500' : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
} 