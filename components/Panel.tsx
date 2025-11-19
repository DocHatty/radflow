import React, { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

const Panel: React.FC<PanelProps> = ({ children, title, actions, footer, className = '', bodyClassName = '' }) => {
  return (
    <div className={`glass-panel ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0">
          {typeof title === 'string' ? (
            <h3 className="text-sm font-semibold text-[var(--color-text-bright)] uppercase tracking-wider">{title}</h3>
          ) : (
            title
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`flex-1 overflow-y-auto p-4 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 bg-[var(--color-panel-bg)]/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Panel;