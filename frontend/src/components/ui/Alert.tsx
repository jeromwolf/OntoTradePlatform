import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type AlertVariant = "success" | "error" | "warning" | "info" | "default";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Alert({
  variant = "default",
  title,
  children,
  className = "",
  dismissible = false,
  onDismiss,
  icon,
  actions,
}: AlertProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: "text-green-400",
          title: "text-green-800",
          content: "text-green-700",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: "text-red-400",
          title: "text-red-800",
          content: "text-red-700",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: "text-yellow-400",
          title: "text-yellow-800",
          content: "text-yellow-700",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: "text-blue-400",
          title: "text-blue-800",
          content: "text-blue-700",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-800",
          icon: "text-gray-400",
          title: "text-gray-800",
          content: "text-gray-700",
        };
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "error":
        return <XCircleIcon className="w-5 h-5" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case "info":
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const styles = getVariantStyles();
  const alertIcon = icon || getDefaultIcon();

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex">
        {alertIcon && (
          <div className={`flex-shrink-0 ${styles.icon}`}>{alertIcon}</div>
        )}

        <div className={`${alertIcon ? "ml-3" : ""} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}

          <div className={`text-sm ${styles.content}`}>{children}</div>

          {actions && <div className="mt-4">{actions}</div>}
        </div>

        {dismissible && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={onDismiss}
              className={`rounded-md ${styles.icon} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 미리 정의된 Alert 컴포넌트들
export function SuccessAlert(props: Omit<AlertProps, "variant">) {
  return <Alert {...props} variant="success" />;
}

export function ErrorAlert(props: Omit<AlertProps, "variant">) {
  return <Alert {...props} variant="error" />;
}

export function WarningAlert(props: Omit<AlertProps, "variant">) {
  return <Alert {...props} variant="warning" />;
}

export function InfoAlert(props: Omit<AlertProps, "variant">) {
  return <Alert {...props} variant="info" />;
}

// Alert 액션 버튼들
export interface AlertActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}

export function AlertAction({
  children,
  onClick,
  variant = "primary",
  size = "sm",
}: AlertActionProps) {
  const getVariantStyles = () => {
    if (variant === "primary") {
      return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
    }
    return "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500";
  };

  const getSizeStyles = () => {
    return size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        ${getVariantStyles()}
        ${getSizeStyles()}
      `}
    >
      {children}
    </button>
  );
}

// Alert 액션 그룹
export interface AlertActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertActions({ children, className = "" }: AlertActionsProps) {
  return <div className={`flex space-x-3 ${className}`}>{children}</div>;
}

export default Alert;
