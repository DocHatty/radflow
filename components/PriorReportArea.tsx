import React from 'react';
import { Prior } from '../types';
import Panel from './Panel';
import EmptyState from './EmptyState';
import { ExpandCollapseIcon } from './Icons';
import { useWorkflowStore } from '../App';


const PriorReportArea: React.FC = () => {
  const priors = useWorkflowStore(state => state.parsedInfo?.priors) || [];

  if (!priors || priors.length === 0) {
    return null;
  }

  return (
    <Panel title="Prior Findings (Reference)" className="h-full">
      <div className="text-[var(--color-text-muted)] text-sm leading-relaxed space-y-3">
        {priors && priors.length > 0 ? (
          priors.map((prior, index) => (
            <div key={index} className="bg-[var(--color-interactive-bg)]/50 p-3 rounded-md border border-[var(--color-border)]">
                <p className="text-[var(--color-text-default)]">{prior.content}</p>
                {prior.date && (
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1.5 pt-1.5 border-t border-[var(--color-border)]">Date: {prior.date}</p>
                )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={<ExpandCollapseIcon className="mx-auto h-12 w-12 opacity-30" />}
            title="No Prior Findings"
            message="No prior findings were provided. The AI will generate the report based on the current clinical information only."
          />
        )}
      </div>
    </Panel>
  );
};

export default PriorReportArea;