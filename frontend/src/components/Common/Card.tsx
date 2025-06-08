import React from 'react';
import theme from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  gradient = false,
  onClick 
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const baseStyle = {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.background.tertiary}`,
    color: theme.colors.text.secondary,
    transition: theme.transitions.normal,
  };

  const hoverStyle = onClick ? {
    cursor: 'pointer',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.lg,
  } : {};

  return (
    <div
      className={`rounded-lg ${paddingClasses[padding]} ${className}`}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (onClick) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onClick={onClick}
    >
      {gradient && (
        <div 
          className="absolute inset-0 rounded-lg opacity-10"
          style={{ background: theme.colors.gradients.primary }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;