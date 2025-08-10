import type { ReactNode } from "react";

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
  return (
    <div className='space-y-1 mb-2'>
      <label
        htmlFor={htmlFor}
        className='block text-sm font-medium text-gray-700'
      >
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {children}
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
