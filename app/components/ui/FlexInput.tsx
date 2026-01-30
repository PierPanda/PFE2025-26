import React from "react";
import { Input } from "@heroui/react";

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
  type = "text",
  name,
  placeholder,
  label,
  isRequired = false,
  value,
  onChange,
  startIcon,
  endIcon,
  iconColor = "from-blue-500 to-purple-600",
  error,
  className = "",
  disabled = false,
}: FlexInputProps) {
  const defaultStartContent = startIcon && (
    <div
      className={`flex items-center justify-center w-5 h-5 rounded-full bg-linear-to-br ${iconColor}`}
    >
      {startIcon}
    </div>
  );

  const defaultEndContent = endIcon && (
    <div
      className={`flex items-center justify-center w-5 h-5 rounded-full bg-linear-to-br ${iconColor}`}
    >
      {endIcon}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
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
              base: "group w-full",
              input: "bg-transparent placeholder:text-gray-500",
              inputWrapper: [
                "bg-white/80 backdrop-blur-sm border-2 border-white/30",
                "group-data-[hover=true]:bg-white/90",
                "group-data-[focus=true]:bg-white/95 group-data-[focus=true]:border-blue-500/50",
                "transition-all duration-300 ease-in-out",
                "shadow-lg hover:shadow-xl",
                error ? "border-red-400/50" : "",
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
        <div className="flex items-center gap-2 mt-1 text-red-600 text-xs">
          <svg
            className="w-3 h-3 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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
  className = "",
  gap = "4",
}: {
  children: React.ReactNode;
  className?: string;
  gap?: string;
}) {
  return (
    <div className={`flex items-start gap-${gap} ${className}`}>{children}</div>
  );
}

// Variant pour grouper des inputs avec des labels alignés
export function FlexInputGroup({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200/50 pb-2">
          {title}
        </h3>
      )}
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

// Variantes d'icônes prédéfinies
export const InputIcons = {
  email: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  ),
  password: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  user: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  ),
  phone: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  ),
  search: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  calendar: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  location: (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};
