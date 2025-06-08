import React from 'react';
import theme from '../../styles/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-lg"
              style={{ color: theme.colors.text.muted }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-3">
            {children}
          </div>
        )}
      </div>
      <hr 
        className="mt-4"
        style={{ borderColor: theme.colors.background.tertiary }}
      />
    </div>
  );
};

export default PageHeader;