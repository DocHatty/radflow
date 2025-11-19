import React from 'react';
import { WarningIcon, CheckCircleIcon, QuestionMarkCircleIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import Panel from './Panel';
import { parseMarkdownToHTML } from '../utils/textUtils';
import { parseGuidance } from '../utils/guidanceUtils';
import { useWorkflowStore } from '../App';

const AnimatedContent: React.FC<{ content: string }> = ({ content }) => {
    return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(content) }} />;
};

const AppropriatenessBadge: React.FC<{ status: 'consistent' | 'inconsistent' | 'indeterminate' | null; reason?: string | null }> = ({ status, reason }) => {
    if (!status) return null;

    const baseClasses = 'text-sm px-4 py-3 rounded-lg mb-4 border animate-fade-in flex flex-col';

    if (status === 'consistent') {
        return (
            <div className={`${baseClasses} bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-text)]`}>
                <div className="flex items-center font-bold">
                    <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Appropriate Study</span>
                </div>
                {reason && (
                    <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">{reason}</p>
                )}
            </div>
        );
    }

    if (status === 'inconsistent') {
        return (
            <div className={`${baseClasses} bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] animate-[pulse-border-warning_2s_ease-in-out_infinite] border-[var(--color-warning-border)]`}>
                <div className="flex items-center font-bold">
                    <WarningIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Suboptimal Protocol</span>
                </div>
                {reason && (
                    <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">{reason}</p>
                )}
            </div>
        );
    }

    if (status === 'indeterminate') {
        return (
            <div className={`${baseClasses} bg-[var(--color-interactive-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]`}>
                <div className="flex items-center font-bold">
                    <QuestionMarkCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Appropriateness Indeterminate</span>
                </div>
                <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">Could not definitively determine appropriateness from provided info.</p>
            </div>
        );
    }

    return null;
};

const ClinicalGuidancePanel: React.FC = () => {
    const { content, isLoading } = useWorkflowStore(state => ({
        content: state.guidanceContent,
        isLoading: state.activeProcess === 'generating'
    }));

    const { status, reason, contentToRender } = parseGuidance(content);
    const showContent = !isLoading || content;

    console.log('EvolvingGuidance render:', {
        contentLength: content?.length,
        isLoading,
        status,
        showContent,
        contentPreview: content?.substring(0, 50)
    });

    return (
        <Panel title="AI Clinical Guidance" className={`flex flex-col h-full ${isLoading ? 'copilot-loading-glow' : ''}`}>
            {isLoading && !content ? (
                <div className="flex justify-center items-center h-full py-10">
                    <LoadingSpinner className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
            ) : showContent ? (
                <>
                    <AppropriatenessBadge status={status} reason={reason} />
                    {contentToRender && <AnimatedContent content={contentToRender} />}
                </>
            ) : (
                <EmptyState message="Real-time guidance will appear here." />
            )}
        </Panel>
    );
};

export default ClinicalGuidancePanel;