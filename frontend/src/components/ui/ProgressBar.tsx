export type ProgressVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info";
export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
  striped?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  showPercentage = true,
  className = "",
  animated = false,
  striped = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-blue-600";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-2";
      case "lg":
        return "h-6";
      default:
        return "h-4";
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div
          className={`flex justify-between items-center mb-1 ${getLabelSize()}`}
        >
          <span className="text-gray-700 font-medium">
            {label || "Progress"}
          </span>
          {showPercentage && (
            <span className="text-gray-500">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${getSizeStyles()}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div
          className={`
            ${getSizeStyles()}
            ${getVariantStyles()}
            transition-all duration-300 ease-out
            ${striped ? "bg-striped" : ""}
            ${animated ? "animate-progress" : ""}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!showLabel && !label && showPercentage && (
        <div className={`text-center mt-1 ${getLabelSize()}`}>
          <span className="text-gray-500">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

// 원형 진행률 표시기
export interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 4,
  variant = "default",
  showLabel = false,
  label,
  className = "",
}: CircularProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getVariantColor = () => {
    switch (variant) {
      case "success":
        return "#10b981"; // green-500
      case "warning":
        return "#f59e0b"; // yellow-500
      case "error":
        return "#ef4444"; // red-500
      case "info":
        return "#3b82f6"; // blue-500
      default:
        return "#2563eb"; // blue-600
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* 진행률 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getVariantColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {showLabel && label ? (
            <div className="text-xs text-gray-600">{label}</div>
          ) : (
            <span className="text-sm font-medium text-gray-900">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// 단계별 진행률 표시기
export interface Step {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current?: boolean;
}

export interface StepProgressProps {
  steps: Step[];
  className?: string;
  variant?: ProgressVariant;
}

export function StepProgress({
  steps,
  className = "",
  variant = "default",
}: StepProgressProps) {
  const getVariantColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500 border-green-500";
      case "warning":
        return "bg-yellow-500 border-yellow-500";
      case "error":
        return "bg-red-500 border-red-500";
      case "info":
        return "bg-blue-500 border-blue-500";
      default:
        return "bg-blue-600 border-blue-600";
    }
  };

  return (
    <div className={`${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:border-4 after:inline-block" : ""}`}
          >
            <span
              className={`
              flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0
              ${
                step.completed
                  ? `${getVariantColor()} text-white`
                  : step.current
                    ? "bg-blue-100 border-2 border-blue-600 text-blue-600"
                    : "bg-gray-100 border-2 border-gray-300 text-gray-500"
              }
            `}
            >
              {step.completed ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </span>

            {step.title && (
              <div className="ml-4 min-w-0 flex-1">
                <div
                  className={`text-sm font-medium ${step.completed || step.current ? "text-gray-900" : "text-gray-500"}`}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// 스피너 컴포넌트 (로딩 표시)
export interface SpinnerProps {
  size?: ProgressSize;
  variant?: ProgressVariant;
  className?: string;
}

export function Spinner({
  size = "md",
  variant = "default",
  className = "",
}: SpinnerProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div
      className={`animate-spin ${getSizeStyles()} ${getVariantColor()} ${className}`}
    >
      <svg fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export default ProgressBar;
