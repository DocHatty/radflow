import React from "react";
import { useShallow } from "zustand/react/shallow";
import ClinicalGuidancePanel from "./EvolvingGuidance";
import { FinalReviewPanel } from "./FinalReviewPanel";
import { DifferentialBuilder } from "./DifferentialBuilder";
import { useWorkflowStore } from "../App";
import { CopilotView } from "../types";
import Panel from "./Panel";
import { LightbulbIcon, ListTreeIcon, ShieldCheckIcon, CheckIcon } from "./Icons";

interface CopilotStepperProps {
  currentView: CopilotView;
  setView: (view: CopilotView) => void;
}

const CopilotStepper: React.FC<CopilotStepperProps> = ({ currentView, setView }) => {
  const steps: { view: CopilotView; name: string; icon: React.FC<any> }[] = [
    { view: "guidance", name: "Guidance", icon: LightbulbIcon },
    { view: "differentials", name: "Differentials", icon: ListTreeIcon },
    { view: "review", name: "Review & Q/A", icon: ShieldCheckIcon },
  ];

  const currentStepIndex = steps.findIndex((s) => s.view === currentView);

  const handleStepClick = (view: CopilotView, index: number) => {
    if (index < currentStepIndex) {
      setView(view);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isClickable = index < currentStepIndex;
        const Icon = step.icon;

        const stepClasses = isCurrent
          ? "border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)"
          : isCompleted
            ? "border-(--color-secondary) bg-(--color-secondary)/10 text-(--color-secondary)"
            : "border-(--color-border) bg-transparent text-(--color-text-muted)";

        return (
          <React.Fragment key={step.view}>
            <div
              className={`flex flex-col items-center text-center ${isClickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
              onClick={() => handleStepClick(step.view, index)}
              role={isClickable ? "button" : "listitem"}
              aria-label={isClickable ? `Go back to ${step.name}` : undefined}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stepClasses}`}
              >
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <p
                className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isCurrent || isCompleted ? "text-(--color-text-bright)" : "text-(--color-text-muted)"}`}
              >
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${isCompleted ? "bg-(--color-secondary)" : "bg-(--color-border)"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const CopilotPanel: React.FC = () => {
  // Use useShallow to prevent unnecessary re-renders
  const { view, setCopilotView, activeProcess } = useWorkflowStore(
    useShallow((state) => ({
      view: state.copilotView,
      setCopilotView: state.setCopilotView,
      activeProcess: state.activeProcess,
    }))
  );

  const isPanelLoading =
    activeProcess === "generatingDifferentials" || activeProcess === "synthesizingImpression";

  const renderContent = () => {
    switch (view) {
      case "guidance":
        return <ClinicalGuidancePanel />;
      case "differentials":
        return <DifferentialBuilder />;
      case "review":
        return <FinalReviewPanel />;
      default:
        return null;
    }
  };

  return (
    <Panel
      title={<CopilotStepper currentView={view} setView={setCopilotView} />}
      className={`h-full ${isPanelLoading ? "copilot-loading-glow" : ""}`}
      bodyClassName="flex flex-col"
    >
      {renderContent()}
    </Panel>
  );
};

export default CopilotPanel;
