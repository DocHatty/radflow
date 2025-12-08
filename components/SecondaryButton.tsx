import React from "react";

type SecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, className, ...props }) => {
  const baseClasses = `
    text-sm font-medium px-4 py-2 rounded-lg
    border border-(--color-border)
    bg-(--color-interactive-bg) text-(--color-text-muted)
    hover:bg-(--color-interactive-bg-hover) hover:border-(--color-border-hover) hover:text-(--color-text-bright)
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200
    flex items-center justify-center
    backdrop-blur-md
    shadow-sm
  `;

  return (
    <button className={`${baseClasses} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};

export default SecondaryButton;
