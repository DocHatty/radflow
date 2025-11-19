import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, isLoading, disabled, className, ...props }) => {
  const isDisabled = isLoading || disabled;
  
  return (
    <button
      disabled={isDisabled}
      className={`
        relative overflow-hidden group
        bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]
        text-white font-bold text-sm tracking-wide uppercase
        px-6 py-3 rounded-lg
        border border-white/20
        shadow-[0_0_20px_rgba(37,99,235,0.3)]
        hover:shadow-[0_0_30px_rgba(244,63,94,0.5),inset_0_0_20px_rgba(255,255,255,0.2)]
        hover:scale-[1.02] active:scale-[0.98]
        disabled:from-slate-800 disabled:to-slate-800 
        disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
        transition-all duration-300 ease-out
        flex items-center justify-center
        font-header
        backdrop-blur-sm
        ${className}
      `}
      {...props}
    >
      {/* Scanner Light Effect */}
      <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shine_1s_ease-in-out_infinite] z-10" />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />

      <div className="relative z-20 flex items-center">
        {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </div>
    </button>
  );
};

export default ActionButton;