import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkflowStore } from "../App";
import { DifferentialDiagnosis } from "../types";
import ActionButton from "./ActionButton";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { CheckIcon } from "./Icons";

const LikelihoodBadge: React.FC<{ likelihood: "High" | "Medium" | "Low" }> = ({ likelihood }) => {
  const colorClasses = {
    High: "bg-red-500/20 text-red-400 border-red-500/30",
    Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Low: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colorClasses[likelihood]}`}
    >
      {likelihood}
    </span>
  );
};

export const DifferentialBuilder: React.FC = () => {
  // Use useShallow to prevent unnecessary re-renders
  const {
    differentials,
    selectedDifferentials,
    updateSelectedDifferentials,
    synthesizeImpression,
    activeProcess,
  } = useWorkflowStore(
    useShallow((state) => ({
      differentials: state.differentials,
      selectedDifferentials: state.selectedDifferentials,
      updateSelectedDifferentials: state.updateSelectedDifferentials,
      synthesizeImpression: state.synthesizeImpression,
      activeProcess: state.activeProcess,
    }))
  );

  const isLoading = activeProcess === "generatingDifferentials";
  const isSynthesizing = activeProcess === "synthesizingImpression";

  const handleToggle = (diagnosis: DifferentialDiagnosis) => {
    const isSelected = selectedDifferentials.some((d) => d.name === diagnosis.name);
    let newSelection;
    if (isSelected) {
      newSelection = selectedDifferentials.filter((d) => d.name !== diagnosis.name);
    } else {
      newSelection = [...selectedDifferentials, diagnosis];
    }
    updateSelectedDifferentials(newSelection);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center">
          <LoadingSpinner className="h-8 w-8 text-(--color-primary)" />
          <p className="mt-3 text-sm text-(--color-text-muted)">
            Generating differential diagnoses based on findings...
          </p>
        </div>
      );
    }

    if (!differentials || differentials.length === 0) {
      return <EmptyState message="Could not generate differential diagnoses from the findings." />;
    }

    return (
      <div className="space-y-3">
        {differentials.map((dx, index) => {
          const isSelected = selectedDifferentials.some((d) => d.name === dx.name);
          return (
            <div
              key={index}
              onClick={() => handleToggle(dx)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-start space-x-4 ${isSelected ? "bg-(--color-primary)/10 border-(--color-primary)/50 ring-1 ring-(--color-primary)/50" : "bg-(--color-interactive-bg)/50 border-(--color-border) hover:border-(--color-border-hover) hover:bg-(--color-interactive-bg-hover)"}`}
            >
              <div
                className={`mt-1 shrink-0 h-5 w-5 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? "bg-(--color-primary) border-(--color-primary)" : "border-gray-500 bg-(--color-base)"}`}
              >
                {isSelected && <CheckIcon className="h-4 w-4 text-white" strokeWidth={3} />}
              </div>
              <div className="grow">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-(--color-text-bright)">{dx.name}</h5>
                  <LikelihoodBadge likelihood={dx.likelihood} />
                </div>
                <p className="text-xs text-(--color-text-muted) mt-1">{dx.rationale}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grow overflow-y-auto pr-2">{renderContent()}</div>
      <div className="flex justify-end pt-4 mt-auto">
        <ActionButton
          onClick={synthesizeImpression}
          isLoading={isSynthesizing}
          disabled={isLoading || isSynthesizing || selectedDifferentials.length === 0}
        >
          {isSynthesizing
            ? "Synthesizing..."
            : `Synthesize Impression (${selectedDifferentials.length})`}
        </ActionButton>
      </div>
    </div>
  );
};
