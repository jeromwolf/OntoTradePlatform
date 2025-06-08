import React from 'react';
import theme from '../../styles/theme';

interface StyledButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const getVariantStyle = () => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.disabled,
        cursor: 'not-allowed',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.gradients.primary,
          color: theme.colors.text.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background.tertiary,
          color: theme.colors.text.secondary,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.status.success,
          color: theme.colors.text.primary,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.status.warning,
          color: theme.colors.text.primary,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.status.error,
          color: theme.colors.text.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.brand.primary}`,
          color: theme.colors.brand.primary,
        };
      default:
        return {
          background: theme.colors.gradients.primary,
          color: theme.colors.text.primary,
        };
    }
  };

  return (
    <button
      className={`rounded-lg font-medium transition-all duration-200 ${sizeClasses[size]} ${className}`}
      style={{
        ...getVariantStyle(),
        transition: theme.transitions.normal,
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
};

export default StyledButton;