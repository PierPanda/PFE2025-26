import React from 'react';
import { Input } from '@heroui/react';

interface FlexInputProps {
  type?: string;
  name: string;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  iconColor?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function FlexInput({
  type = 'text',
  name,
  placeholder,
  label,
  isRequired = false,
  value,
  onChange,
  startIcon,
  endIcon,
  iconColor = 'from-blue-500 to-purple-600',
  error,
  className = '',
  disabled = false,
}: FlexInputProps) {
  const defaultStartContent = startIcon && (
    <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br ${iconColor}`}>
      {startIcon}
    </div>
  );

  const defaultEndContent = endIcon && (
    <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br ${iconColor}`}>
      {endIcon}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label */}
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input Container - Flex Layout */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type={type}
            name={name}
            placeholder={placeholder}
            isRequired={isRequired}
            value={value}
            onChange={onChange}
            variant="flat"
            size="lg"
            radius="lg"
            isDisabled={disabled}
            isInvalid={!!error}
            classNames={{
              base: 'group w-full',
              input: 'bg-transparent placeholder:text-gray-500',
              inputWrapper: [
                'bg-white/80 backdrop-blur-sm border-2 border-white/30',
                'group-data-[hover=true]:bg-white/90',
                'group-data-[focus=true]:bg-white/95 group-data-[focus=true]:border-blue-500/50',
                'transition-all duration-300 ease-in-out',
                'shadow-lg hover:shadow-xl',
                error ? 'border-red-400/50' : '',
              ],
            }}
            startContent={defaultStartContent}
            endContent={defaultEndContent}
          />
        </div>

        {/* Additional content can be added here for flex layout */}
        {/* For example: action buttons, status indicators, etc. */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 flex items-center gap-2 text-xs text-red-600">
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Variant pour des inputs côte à côte
export function FlexInputRow({
  children,
  className = '',
  gap = '4',
}: {
  children: React.ReactNode;
  className?: string;
  gap?: string;
}) {
  return <div className={`flex items-start gap-${gap} ${className}`}>{children}</div>;
}

export function FlexInputGroup({
  children,
  title,
  className = '',
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="border-b border-gray-200/50 pb-2 text-lg font-semibold text-gray-800">{title}</h3>}
      <div className="grid gap-4">{children}</div>
    </div>
  );
}
