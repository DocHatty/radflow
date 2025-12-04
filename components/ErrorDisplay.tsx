import React from 'react';
import { XIcon, AlertIcon } from './Icons';
import { useWorkflowStore } from '../App';

const ErrorDisplay: React.FC = () => {
  const error = useWorkflowStore(state => state.error);
  const setError = useWorkflowStore(state => state.setError);
  
  if (!error) return null;

  return (
    <div className="alert-base alert-danger w-full max-w-3xl mx-auto" role="alert">
      <AlertIcon className="h-6 w-6 mr-3 text-(--color-danger-text) shrink-0 mt-1" />
      <div className="grow">
          <strong className="font-bold block">{error.context || 'An Error Occurred'}</strong>
          <span className="block text-sm">{error.message}</span>
      </div>
      <button onClick={() => setError(null)} className="p-1 ml-4 -mt-1 -mr-1 rounded-full hover:bg-(--color-interactive-bg-hover) transition-colors" aria-label="Dismiss">
          <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ErrorDisplay;