import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="text-center text-[var(--color-text-muted)] p-4">
        {icon}
        {title && <h3 className="font-semibold mt-2 text-white">{title}</h3>}
        <p className={`text-xs ${title ? 'mt-1' : ''}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
