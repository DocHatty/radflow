import React, { useMemo, memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { WarningIcon, CheckCircleIcon, QuestionMarkCircleIcon } from "./Icons";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import Panel from "./Panel";
import { parseGuidance } from "../utils/guidanceUtils";
import { useWorkflowStore } from "../App";
import { RundownSection } from "../services/rundownService";

// Parse a line and extract emphasized parts (text before colon is the key point)
const parseLineWithEmphasis = (text: string): React.ReactNode => {
  // Match pattern: "Key point: explanation" or "Key point (detail)"
  const colonMatch = text.match(/^([^:]+):\s*(.+)$/);
  const parenMatch = text.match(/^(.+?)\s*\(([^)]+)\)$/);

  if (colonMatch) {
    const [, keyPoint, explanation] = colonMatch;
    return (
      <>
        <span className="font-semibold text-(--color-text-default)">{keyPoint}</span>
        <span className="text-(--color-text-muted)">: {explanation}</span>
      </>
    );
  }

  if (parenMatch) {
    const [, mainText, parenthetical] = parenMatch;
    return (
      <>
        <span className="font-medium text-(--color-text-default)">{mainText}</span>
        <span className="text-(--color-text-muted)"> ({parenthetical})</span>
      </>
    );
  }

  return text;
};

// Format content with beautiful spacing
const formatContent = (content: string): React.ReactNode => {
  if (!content) return null;

  const cleanedContent = content
    .replace(/undefined/gi, "")
    .replace(/\s+$/, "")
    .trim();

  if (!cleanedContent) return null;

  const lines = cleanedContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // Check if content is numbered list
  const isNumberedList = lines.every((line) => /^\d+[.)]\s/.test(line));

  // Check if content is bullet list
  const isBulletList = lines.every((line) => /^[•\-*]\s/.test(line));

  if (isNumberedList) {
    return (
      <ol className="space-y-3">
        {lines.map((line, idx) => {
          const text = line.replace(/^\d+[.)]\s*/, "").trim();
          return (
            <li key={idx} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-sm leading-relaxed flex-1 pt-0.5">
                {parseLineWithEmphasis(text)}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  if (isBulletList) {
    return (
      <ul className="space-y-3">
        {lines.map((line, idx) => {
          const text = line.replace(/^[•\-*]\s*/, "").trim();
          return (
            <li key={idx} className="flex gap-3 items-start">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-(--color-primary) mt-2" />
              <span className="text-sm leading-relaxed flex-1">{parseLineWithEmphasis(text)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Default: paragraph
  return <div className="text-sm leading-relaxed">{parseLineWithEmphasis(cleanedContent)}</div>;
};

// Section icons
const SectionIcons: Record<string, React.ReactNode> = {
  "Most Likely Diagnoses": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  "Top Facts": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "What to Look For": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  "Pitfalls & Mimics": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  "Search Pattern": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  "Pertinent Negatives": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "Classic Signs": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
};

// Beautiful section card
const SectionCard: React.FC<{ section: RundownSection }> = memo(({ section }) => {
  if (!section) return null;
  if (!section.content && !section.isLoading && !section.error) return null;

  const icon = SectionIcons[section.title];

  return (
    <div className="bg-(--color-panel-bg) border border-(--color-border) rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-(--color-primary) opacity-80">{icon}</span>}
        <h3 className="text-xs font-bold text-(--color-primary) uppercase tracking-wider">
          {section.title}
        </h3>
      </div>

      {/* Content */}
      {section.isLoading ? (
        <div className="flex items-center gap-3 py-4">
          <LoadingSpinner className="w-4 h-4 text-(--color-primary)" />
          <span className="text-sm text-(--color-text-muted)">Loading...</span>
        </div>
      ) : section.error ? (
        <div className="text-sm text-(--color-danger-text) bg-(--color-danger-bg) border border-(--color-danger-border) rounded-lg px-4 py-3">
          {section.error}
        </div>
      ) : section.content ? (
        <div className="text-(--color-text-default)">{formatContent(section.content)}</div>
      ) : null}
    </div>
  );
});

// Appropriateness badge
const AppropriatenessBadge: React.FC<{
  status: "consistent" | "inconsistent" | "indeterminate" | null;
  reason?: string | null;
  isLoading?: boolean;
}> = memo(({ status, reason, isLoading }) => {
  if (isLoading) {
    return (
      <div className="px-5 py-4 rounded-xl border bg-(--color-panel-bg) border-(--color-border) flex items-center gap-3">
        <LoadingSpinner className="w-5 h-5 text-(--color-primary)" />
        <span className="text-sm text-(--color-text-muted)">Evaluating appropriateness...</span>
      </div>
    );
  }

  if (!status) return null;

  const configs = {
    consistent: {
      bg: "bg-(--color-success-bg)",
      border: "border-(--color-success-border)",
      text: "text-(--color-success-text)",
      icon: <CheckCircleIcon className="h-5 w-5 shrink-0" />,
      title: "Appropriate Study",
    },
    inconsistent: {
      bg: "bg-(--color-warning-bg)",
      border: "border-(--color-warning-border)",
      text: "text-(--color-warning-text)",
      icon: <WarningIcon className="h-5 w-5 shrink-0" />,
      title: "Suboptimal Protocol",
    },
    indeterminate: {
      bg: "bg-(--color-panel-bg)",
      border: "border-(--color-border)",
      text: "text-(--color-text-muted)",
      icon: <QuestionMarkCircleIcon className="h-5 w-5 shrink-0" />,
      title: "Appropriateness Indeterminate",
    },
  };

  const config = configs[status];
  const displayReason =
    status === "indeterminate"
      ? "Could not definitively determine appropriateness from provided information."
      : reason;

  return (
    <div
      className={`px-5 py-4 rounded-xl border ${config.bg} ${config.border} ${config.text} animate-fade-in`}
    >
      <div className="flex items-center gap-3 font-semibold">
        {config.icon}
        <span>{config.title}</span>
      </div>
      {displayReason && (
        <p className="mt-2 ml-8 text-sm opacity-90 leading-relaxed">{displayReason}</p>
      )}
    </div>
  );
});

// Bottom line special card
const BottomLineCard: React.FC<{ section: RundownSection }> = memo(({ section }) => {
  if (!section) return null;
  if (!section.content && !section.isLoading) return null;

  return (
    <div className="relative">
      {/* Decorative line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--color-primary) rounded-full" />

      <div className="ml-4 bg-(--color-primary)/5 rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <svg
            className="w-4 h-4 text-(--color-primary)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <h3 className="text-xs font-bold text-(--color-primary) uppercase tracking-wider">
            Bottom Line
          </h3>
        </div>

        {section.isLoading ? (
          <div className="flex items-center gap-3">
            <LoadingSpinner className="w-4 h-4 text-(--color-primary)" />
            <span className="text-sm text-(--color-text-muted)">Synthesizing...</span>
          </div>
        ) : (
          <p className="text-sm text-(--color-text-default) font-medium leading-relaxed">
            {section.content}
          </p>
        )}
      </div>
    </div>
  );
});

const ClinicalGuidancePanel: React.FC = () => {
  // Use useShallow to prevent unnecessary re-renders
  const { guidanceContent, rundownData, isGeneratingRundown, isFetchingGuidance, activeProcess } =
    useWorkflowStore(
      useShallow((state) => ({
        guidanceContent: state.guidanceContent,
        rundownData: state.rundownData,
        isGeneratingRundown: state.isGeneratingRundown,
        isFetchingGuidance: state.isFetchingGuidance,
        activeProcess: state.activeProcess,
      }))
    );

  const { status, reason } = useMemo(() => parseGuidance(guidanceContent), [guidanceContent]);

  const isLoading = activeProcess === "generating" || isFetchingGuidance;

  const hasRundownContent =
    rundownData &&
    Object.values(rundownData).some((section) => section.content || section.isLoading);

  const showEmptyState =
    !guidanceContent && !hasRundownContent && !isLoading && !isGeneratingRundown;

  return (
    <Panel
      title="AI Clinical Guidance"
      className={`flex flex-col h-full ${isLoading || isGeneratingRundown ? "copilot-loading-glow" : ""}`}
    >
      {showEmptyState ? (
        <EmptyState message="Clinical guidance will appear here." />
      ) : (
        <div className="space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Appropriateness Badge */}
          <AppropriatenessBadge
            status={status}
            reason={reason}
            isLoading={isFetchingGuidance && !guidanceContent}
          />

          {/* Rundown Sections */}
          {rundownData && (
            <div className="space-y-4">
              {/* Most Likely - if it exists */}
              {rundownData.mostLikely && <SectionCard section={rundownData.mostLikely} />}

              {/* Top Facts */}
              <SectionCard section={rundownData.topFacts} />

              {/* What to Look For */}
              <SectionCard section={rundownData.whatToLookFor} />

              {/* Two-column for Pitfalls and Classic Signs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SectionCard section={rundownData.pitfalls} />
                <SectionCard section={rundownData.classicSigns} />
              </div>

              {/* Search Pattern */}
              <SectionCard section={rundownData.searchPattern} />

              {/* Pertinent Negatives */}
              <SectionCard section={rundownData.pertinentNegatives} />

              {/* Bottom Line - Special styling */}
              {rundownData.bottomLine &&
                (rundownData.bottomLine.content || rundownData.bottomLine.isLoading) && (
                  <div className="pt-2">
                    <BottomLineCard section={rundownData.bottomLine} />
                  </div>
                )}
            </div>
          )}

          {/* Loading state */}
          {!rundownData && isGeneratingRundown && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
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
