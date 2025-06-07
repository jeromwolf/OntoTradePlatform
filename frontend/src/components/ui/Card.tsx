import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "stat" | "portfolio" | "analysis";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const baseStyles =
      "rounded-xl border bg-white shadow-sm transition-all duration-200";

    const variants = {
      default: "border-slate-200 p-6",
      stat: "border-slate-200 p-4 text-center hover:shadow-md hover:border-blue-200",
      portfolio: "border-slate-200 p-5 hover:shadow-lg",
      analysis: "border-slate-200 p-6 bg-gradient-to-br from-white to-slate-50",
    };

    const hoverStyles = hover
      ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      : "";

    return (
      <div
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

// CardHeader 컴포넌트
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-3", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

// CardTitle 컴포넌트
const CardTitle = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { emoji?: string }
>(({ className, emoji, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold text-slate-900 flex items-center gap-2",
      className,
    )}
    {...props}
  >
    {emoji && <span className="text-xl">{emoji}</span>}
    {children}
  </div>
));
CardTitle.displayName = "CardTitle";

// CardContent 컴포넌트
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

// StatCard 컴포넌트 (OntoTrade 스타일)
interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: string;
  value: string | number;
  label: string;
  change?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, icon, value, label, change, ...props }, ref) => (
    <Card
      variant="stat"
      ref={ref}
      className={cn("min-w-[140px]", className)}
      {...props}
    >
      <div className="stat-icon text-2xl mb-2">{icon}</div>
      <div className="stat-value text-2xl font-bold text-slate-900 mb-1">
        {value}
      </div>
      <div className="stat-label text-sm text-slate-600 mb-2">{label}</div>
      {change && (
        <div
          className={cn(
            "stat-change text-xs font-medium",
            change.type === "up" && "text-green-600",
            change.type === "down" && "text-red-600",
            change.type === "neutral" && "text-slate-600",
          )}
        >
          {change.value}
        </div>
      )}
    </Card>
  ),
);
StatCard.displayName = "StatCard";

export { Card, CardHeader, CardTitle, CardContent, StatCard };
