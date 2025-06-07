import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  emoji?: string;
  error?: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, emoji, error, description, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <div className="flex items-center h-5">
            <input
              type="radio"
              id={radioId}
              className={cn(
                "h-4 w-4 border-2 border-slate-300 text-blue-600",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200",
                error && "border-red-500 focus:ring-red-500",
                className,
              )}
              ref={ref}
              {...props}
            />
          </div>
          {(label || emoji) && (
            <div className="flex-1">
              <label
                htmlFor={radioId}
                className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-1"
              >
                {emoji && <span>{emoji}</span>}
                {label}
              </label>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1 ml-6">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
