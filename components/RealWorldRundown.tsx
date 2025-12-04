import React from "react";
import Panel from "./Panel";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { RundownData, RundownSection } from "../services/rundownService";

interface SectionCardProps {
  section: RundownSection;
}

const SectionCard: React.FC<SectionCardProps> = ({ section }) => {
  return (
    <div className="bg-(--color-panel-bg) border border-(--color-border) rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-bold text-(--color-primary) uppercase tracking-wide">
        {section.title}
      </h3>
      {section.isLoading ? (
        <div className="flex justify-center items-center py-4">
          <LoadingSpinner className="w-6 h-6 text-(--color-primary)" />
        </div>
      ) : section.error ? (
        <div className="text-xs text-(--color-danger-text) bg-(--color-danger-bg) border border-(--color-danger-border) rounded px-3 py-2">
          {section.error}
        </div>
      ) : section.content ? (
        <div className="text-sm text-(--color-text-default) whitespace-pre-wrap leading-relaxed">
          {section.content}
        </div>
      ) : (
        <div className="text-xs text-(--color-text-muted) italic">
          Waiting...
        </div>
      )}
    </div>
  );
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
    Object.values(data).some((section) => section.content || section.isLoading);

  return (
    <Panel
      title="Real-World Rundown"
      className={`flex flex-col h-full ${isGenerating ? "copilot-loading-glow" : ""}`}
    >
      {!data || (!hasAnyContent && !isGenerating) ? (
        <EmptyState message="Real-world clinical guidance will appear here." />
      ) : (
        <div className="space-y-3 overflow-y-auto">
          <SectionCard section={data.topFacts} />
          <SectionCard section={data.whatToLookFor} />
          <SectionCard section={data.pitfalls} />
          <SectionCard section={data.searchPattern} />
          <SectionCard section={data.pertinentNegatives} />
          <SectionCard section={data.classicSigns} />
          <SectionCard section={data.bottomLine} />
        </div>
      )}
    </Panel>
  );
};

export default RealWorldRundown;
