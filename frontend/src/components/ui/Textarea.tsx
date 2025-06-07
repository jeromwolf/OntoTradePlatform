import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  emoji?: string;
  error?: string;
  label?: string;
  resizable?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, emoji, error, label, id, resizable = true, ...props }, ref) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-slate-700 flex items-center gap-1"
          >
            {emoji && <span>{emoji}</span>}
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              error && "border-red-500 focus:ring-red-500",
              !resizable && "resize-none",
              className,
            )}
            ref={ref}
            {...props}
          />
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

Textarea.displayName = "Textarea";

export { Textarea };
