import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  emoji?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, emoji, required, size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <label
        className={cn(
          "font-medium text-slate-700 flex items-center gap-1 cursor-pointer",
          sizes[size],
          className,
        )}
        ref={ref}
        {...props}
      >
        {emoji && <span>{emoji}</span>}
        {children}
        {required && <span className="text-red-500">*</span>}
      </label>
    );
  },
);

Label.displayName = "Label";

export { Label };
