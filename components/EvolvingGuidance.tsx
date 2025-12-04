import React, { useMemo, memo } from "react";
import { WarningIcon, CheckCircleIcon, QuestionMarkCircleIcon } from "./Icons";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import Panel from "./Panel";
import { parseGuidance } from "../utils/guidanceUtils";
import { useWorkflowStore } from "../App";
import { RundownSection } from "../services/rundownService";

// Format content: convert bullet points and numbered lists to proper line items
const formatContent = (content: string): React.ReactNode => {
  if (!content) return null;

  // Clean up common AI artifacts: "undefined", trailing whitespace, etc.
  const cleanedContent = content
    .replace(/undefined/gi, "")
    .replace(/\s+$/, "")
    .trim();

  if (!cleanedContent) return null;

  // Split by bullet points (•) or numbered items (1. 2. etc) and filter empty
  const lines = cleanedContent
    .split(/(?=•)|(?=\d+\.\s)/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== "undefined");

  if (lines.length <= 1) {
    // No bullets/numbers found, just return the content
    return <span>{cleanedContent}</span>;
  }

  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => {
        // Clean up the line - remove leading bullet or number
        const cleanLine = line.replace(/^[•]\s*/, "").replace(/^\d+\.\s*/, "");
        const isNumbered = /^\d+\./.test(line);

        return (
          <li key={i} className="flex gap-2">
            <span className="text-(--color-primary) shrink-0">
              {isNumbered ? `${i + 1}.` : "•"}
            </span>
            <span>{cleanLine}</span>
          </li>
        );
      })}
    </ul>
  );
};

// Compact section card for rundown items - memoized to prevent unnecessary re-renders
const SectionCard: React.FC<{ section: RundownSection; compact?: boolean }> =
  memo(({ section, compact = false }) => {
    if (!section) return null;

    // Don't render if no content and not loading
    if (!section.content && !section.isLoading && !section.error) return null;

    return (
      <div
        className={`bg-(--color-interactive-bg) border border-(--color-border) rounded ${compact ? "p-2" : "p-3"}`}
      >
        <h3 className="text-xs font-semibold text-(--color-primary) uppercase tracking-wide mb-2">
          {section.title}
        </h3>
        {section.isLoading ? (
          <div className="flex items-center gap-2 py-1">
            <LoadingSpinner className="w-3 h-3 text-(--color-primary)" />
            <span className="text-xs text-(--color-text-muted)">
              Loading...
            </span>
          </div>
        ) : section.error ? (
          <div className="text-xs text-(--color-danger-text)">
            {section.error}
          </div>
        ) : section.content ? (
          <div className="text-xs text-(--color-text-default) leading-relaxed">
            {formatContent(section.content)}
          </div>
        ) : null}
      </div>
    );
  });

// Appropriateness badge component - memoized to prevent unnecessary re-renders
const AppropriatenessBadge: React.FC<{
  status: "consistent" | "inconsistent" | "indeterminate" | null;
  reason?: string | null;
  isLoading?: boolean;
}> = memo(({ status, reason, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-sm px-4 py-3 rounded-lg mb-3 border bg-(--color-interactive-bg) border-(--color-border) flex items-center gap-2">
        <LoadingSpinner className="w-5 h-5 text-(--color-primary)" />
        <span className="text-(--color-text-muted)">
          Evaluating appropriateness...
        </span>
      </div>
    );
  }

  if (!status) return null;

  const baseClasses =
    "text-sm px-4 py-3 rounded-lg mb-3 border animate-fade-in flex flex-col";

  if (status === "consistent") {
    return (
      <div
        className={`${baseClasses} bg-(--color-success-bg) border-(--color-success-border) text-(--color-success-text)`}
      >
        <div className="flex items-center font-bold">
          <CheckCircleIcon className="h-5 w-5 mr-2 shrink-0" />
          <span>Appropriate Study</span>
        </div>
        {reason && (
          <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">{reason}</p>
        )}
      </div>
    );
  }

  if (status === "inconsistent") {
    return (
      <div
        className={`${baseClasses} bg-(--color-warning-bg) text-(--color-warning-text) animate-[pulse-border-warning_2s_ease-in-out_infinite] border-(--color-warning-border)`}
      >
        <div className="flex items-center font-bold">
          <WarningIcon className="h-5 w-5 mr-2 shrink-0" />
          <span>Suboptimal Protocol</span>
        </div>
        {reason && (
          <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">{reason}</p>
        )}
      </div>
    );
  }

  if (status === "indeterminate") {
    return (
      <div
        className={`${baseClasses} bg-(--color-interactive-bg) border-(--color-border) text-(--color-text-muted)`}
      >
        <div className="flex items-center font-bold">
          <QuestionMarkCircleIcon className="h-5 w-5 mr-2 shrink-0" />
          <span>Appropriateness Indeterminate</span>
        </div>
        <p className="mt-1.5 pl-7 opacity-90 text-xs font-normal">
          Could not definitively determine appropriateness from provided info.
        </p>
      </div>
    );
  }

  return null;
});

const ClinicalGuidancePanel: React.FC = () => {
  const {
    guidanceContent,
    rundownData,
    isGeneratingRundown,
    isFetchingGuidance,
    activeProcess,
  } = useWorkflowStore((state) => ({
    guidanceContent: state.guidanceContent,
    rundownData: state.rundownData,
    isGeneratingRundown: state.isGeneratingRundown,
    isFetchingGuidance: state.isFetchingGuidance,
    activeProcess: state.activeProcess,
  }));

  // Memoize parseGuidance to avoid re-parsing on every render
  const { status, reason } = useMemo(
    () => parseGuidance(guidanceContent),
    [guidanceContent],
  );

  const isLoading = activeProcess === "generating" || isFetchingGuidance;

  // Check if we have any rundown content
  const hasRundownContent =
    rundownData &&
    Object.values(rundownData).some(
      (section) => section.content || section.isLoading,
    );

  // Show loading state if nothing is available yet
  const showEmptyState =
    !guidanceContent &&
    !hasRundownContent &&
    !isLoading &&
    !isGeneratingRundown;

  return (
    <Panel
      title="AI Clinical Guidance"
      className={`flex flex-col h-full ${isLoading || isGeneratingRundown ? "copilot-loading-glow" : ""}`}
    >
      {showEmptyState ? (
        <EmptyState message="Clinical guidance will appear here." />
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {/* Appropriateness Badge - Always at top */}
          <AppropriatenessBadge
            status={status}
            reason={reason}
            isLoading={isFetchingGuidance && !guidanceContent}
          />

          {/* Rundown Sections - Card-based layout */}
          {rundownData && (
            <>
              {/* Primary sections - more prominent */}
              <SectionCard section={rundownData.topFacts} />
              <SectionCard section={rundownData.whatToLookFor} />

              {/* Two-column layout for secondary sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <SectionCard section={rundownData.pitfalls} compact />
                <SectionCard section={rundownData.classicSigns} compact />
              </div>

              {/* Search pattern - full width */}
              <SectionCard section={rundownData.searchPattern} />

              {/* Pertinent negatives */}
              <SectionCard section={rundownData.pertinentNegatives} compact />

              {/* Bottom line - highlighted */}
              {rundownData.bottomLine &&
                (rundownData.bottomLine.content ||
                  rundownData.bottomLine.isLoading) && (
                  <div className="bg-(--color-primary) bg-opacity-10 border border-(--color-primary) border-opacity-30 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-(--color-primary) uppercase tracking-wide mb-1">
                      Bottom Line
                    </h3>
                    {rundownData.bottomLine.isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner className="w-4 h-4 text-(--color-primary)" />
                        <span className="text-xs text-(--color-text-muted)">
                          Synthesizing...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-(--color-text-default) font-medium">
                        {rundownData.bottomLine.content}
                      </p>
                    )}
                  </div>
                )}
            </>
          )}

          {/* Show loading state for rundown if no data yet */}
          {!rundownData && isGeneratingRundown && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <LoadingSpinner className="w-8 h-8 text-(--color-primary)" />
              <span className="text-sm text-(--color-text-muted)">
                Generating clinical guidance...
              </span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};

export default ClinicalGuidancePanel;
