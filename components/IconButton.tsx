import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  'aria-label': string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, className, ...props }) => {
  const baseClasses = "p-2.5 rounded-full border border-(--color-border) hover:border-(--color-border-hover) hover:text-(--color-text-bright) transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const defaultClasses = "bg-(--color-interactive-bg) text-(--color-text-muted) hover:bg-(--color-interactive-bg-hover)";

  return (
    <button
      className={`${baseClasses} ${className || defaultClasses}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;