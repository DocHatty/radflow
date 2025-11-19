import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // No special props needed yet, but structure is here for future expansion
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, className, ...props }) => {
  const baseClasses = `
    text-sm font-medium px-4 py-2 rounded-lg
    border border-[var(--color-border)]
    bg-[var(--color-interactive-bg)] text-[var(--color-text-muted)]
    hover:bg-[var(--color-interactive-bg-hover)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-bright)]
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200
    flex items-center justify-center
    backdrop-blur-md
    shadow-sm
  `;

  return (
    <button
      className={`${baseClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;