import React from 'react';
import { Guideline } from './followUpGuidelines';
import { InfoIcon } from '../components/Icons';

interface GuidelineReferenceProps {
    guidelines: Guideline[];
}

const GuidelineReference: React.FC<GuidelineReferenceProps> = ({ guidelines }) => {
    if (!guidelines || guidelines.length === 0) {
        return null;
    }

    return (
        <div className="text-xs text-center text-[var(--color-text-muted)] animate-fade-in">
            <span className="font-semibold">AI review based on:</span>
            {guidelines.map((g, index) => (
                <div key={g.topic} className="inline-block group relative ml-2">
                    <span className="cursor-help border-b border-dotted border-[var(--color-text-muted)]">
                        {g.topic}
                    </span>
                    {index < guidelines.length - 1 && ','}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-md shadow-lg text-left text-sm
                                    bg-[var(--color-base)] border border-[var(--color-border)] text-[var(--color-text-default)]
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <h5 className="font-bold text-[var(--color-primary)] flex items-center">
                           <InfoIcon className="w-4 h-4 mr-2" /> 
                           {g.topic}
                        </h5>
                        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{g.summary}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GuidelineReference;
