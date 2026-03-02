import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
}

export function FormField({ 
  label, 
  error, 
  success, 
  required, 
  children, 
  className = '',
  helpText 
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {/* Success indicator */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {/* Help text */}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, success, className = '', ...props }, ref) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const errorClass = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
    const successClass = success && !error ? "border-green-300 focus:ring-green-500 focus:border-green-500" : "";
    const normalClass = !error && !success ? "border-gray-300" : "";
    
    return (
      <input
        ref={ref}
        className={`${baseClass} ${errorClass} ${successClass} ${normalClass} ${className}`}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, success, className = '', ...props }, ref) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical";
    const errorClass = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
    const successClass = success && !error ? "border-green-300 focus:ring-green-500 focus:border-green-500" : "";
    const normalClass = !error && !success ? "border-gray-300" : "";
    
    return (
      <textarea
        ref={ref}
        className={`${baseClass} ${errorClass} ${successClass} ${normalClass} ${className}`}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  success?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, success, options, placeholder, className = '', ...props }, ref) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white";
    const errorClass = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
    const successClass = success && !error ? "border-green-300 focus:ring-green-500 focus:border-green-500" : "";
    const normalClass = !error && !success ? "border-gray-300" : "";
    
    return (
      <select
        ref={ref}
        className={`${baseClass} ${errorClass} ${successClass} ${normalClass} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function FormButton({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  children, 
  className = '', 
  disabled,
  ...props 
}: FormButtonProps) {
  const baseClass = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300",
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// Form validation state hook
export function useFormFieldState(value: string | number | null | undefined, error?: string) {
  const hasValue = React.useMemo(() => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return value !== null && value !== undefined;
  }, [value]);
  
  const success = hasValue && !error;
  
  return { success, hasValue };
}
