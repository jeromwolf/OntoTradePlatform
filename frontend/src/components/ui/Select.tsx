import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  emoji?: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  emoji?: string;
  error?: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, emoji, error, label, id, options, placeholder, ...props },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700 flex items-center gap-1"
          >
            {emoji && <span>{emoji}</span>}
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 appearance-none",
              "bg-[url(\"data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")]",
              "bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat",
              error && "border-red-500 focus:ring-red-500",
              className,
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.emoji
                  ? `${option.emoji} ${option.label}`
                  : option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
