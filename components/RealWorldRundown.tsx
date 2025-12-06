import React from "react";
import Panel from "./Panel";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { RundownData, RundownSection } from "../services/rundownService";

// Parse and render content with proper formatting
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  // Check if content is numbered list (1. 2. 3. etc)
  const isNumberedList = lines.every((line) =>
    /^\d+[\.\)]\s/.test(line.trim()),
  );

  // Check if content is bullet list (• - * etc)
  const isBulletList = lines.every((line) => /^[•\-\*]\s/.test(line.trim()));

  if (isNumberedList) {
    return (
      <ol className="space-y-3">
        {lines.map((line, idx) => {
          const text = line.replace(/^\d+[\.\)]\s*/, "").trim();
          const parts = parseLineWithEmphasis(text);
          return (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-(--color-primary)/15 text-(--color-primary) flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-sm text-(--color-text-default) leading-relaxed flex-1">
                {parts}
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
          const text = line.replace(/^[•\-\*]\s*/, "").trim();
          const parts = parseLineWithEmphasis(text);
          return (
            <li key={idx} className="flex gap-3 items-start">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-(--color-primary) mt-2" />
              <span className="text-sm text-(--color-text-default) leading-relaxed flex-1">
                {parts}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Default: render as paragraph with emphasis parsing
  return (
    <div className="text-sm text-(--color-text-default) leading-relaxed">
      {parseLineWithEmphasis(content)}
    </div>
  );
};

// Parse a line and extract emphasized parts (text before colon is the key point)
const parseLineWithEmphasis = (text: string): React.ReactNode => {
  // Split on colon to separate key point from explanation (but not time formats like 2:30)
  const colonMatch = text.match(/^([^:]+):\s+(.+)$/);

  if (colonMatch) {
    const [, keyPoint, explanation] = colonMatch;
    return (
      <>
        <span className="font-semibold text-(--color-text-default)">
          {keyPoint}
        </span>
        <span className="text-(--color-text-muted)">: {explanation}</span>
      </>
    );
  }

  return text;
};

interface SectionCardProps {
  section: RundownSection;
  icon?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, icon }) => {
  return (
    <div className="bg-(--color-panel-bg) border border-(--color-border) rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        {icon && <span className="text-(--color-primary)">{icon}</span>}
        <h3 className="text-xs font-bold text-(--color-primary) uppercase tracking-wider">
          {section.title}
        </h3>
      </div>
      {section.isLoading ? (
        <div className="flex justify-center items-center py-6">
          <LoadingSpinner className="w-5 h-5 text-(--color-primary)" />
        </div>
      ) : section.error ? (
        <div className="text-xs text-(--color-danger-text) bg-(--color-danger-bg) border border-(--color-danger-border) rounded-lg px-3 py-2">
          {section.error}
        </div>
      ) : section.content ? (
        <FormattedContent content={section.content} />
      ) : (
        <div className="text-xs text-(--color-text-muted) italic py-2">
          Waiting...
        </div>
      )}
    </div>
  );
};

// Icons for each section
const Icons = {
  topFacts: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  whatToLookFor: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  pitfalls: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  searchPattern: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  pertinentNegatives: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  classicSigns: (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
  bottomLine: (
    <svg
      className="w-4 h-4"
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
  ),
};

interface RealWorldRundownProps {
  data: RundownData | null;
  isGenerating: boolean;
}

const RealWorldRundown: React.FC<RealWorldRundownProps> = ({
  data,
  isGenerating,
}) => {
  const hasAnyContent =
    data &&
    Object.values(data).some(
      (section: RundownSection) => section.content || section.isLoading,
    );

  return (
    <Panel
      title="Real-World Rundown"
      className={`flex flex-col h-full ${isGenerating ? "copilot-loading-glow" : ""}`}
    >
      {!data || (!hasAnyContent && !isGenerating) ? (
        <EmptyState message="Real-world clinical guidance will appear here." />
      ) : (
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* High-yield pearls - most important, at the top */}
          <SectionCard section={data.topFacts} icon={Icons.topFacts} />

          {/* What to hunt for */}
          <SectionCard
            section={data.whatToLookFor}
            icon={Icons.whatToLookFor}
          />

          {/* Two-column layout for pitfalls and classic signs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard section={data.pitfalls} icon={Icons.pitfalls} />
            <SectionCard
              section={data.classicSigns}
              icon={Icons.classicSigns}
            />
          </div>

          {/* Search pattern - full width, important workflow item */}
          <SectionCard
            section={data.searchPattern}
            icon={Icons.searchPattern}
          />

          {/* Pertinent negatives */}
          <SectionCard
            section={data.pertinentNegatives}
            icon={Icons.pertinentNegatives}
          />

          {/* Bottom line - the takeaway */}
          <div className="border-t border-(--color-border) pt-4">
            <SectionCard section={data.bottomLine} icon={Icons.bottomLine} />
          </div>
        </div>
      )}
    </Panel>
  );
};

export default RealWorldRundown;
