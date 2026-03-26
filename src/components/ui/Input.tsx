import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${className}`}
          {...props}
        />
        {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
