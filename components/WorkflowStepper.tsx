import React from "react";

type WorkflowStage = "input" | "verification" | "submitted";

interface WorkflowStepperProps {
  stage: WorkflowStage;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ stage }) => {
  const steps = [
    { id: "input", name: "Data Intake" },
    { id: "verification", name: "Verification" },
    { id: "submitted", name: "Report Gen" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === stage);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in px-4 mt-6">
      <div className="relative flex items-center justify-between h-12">
        {/* Circuit Track Background - Minimal */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0"></div>

        {/* Active Circuit Flow - Glowing Gradient */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 z-0 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.8)]"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse"></div>
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              {/* Node - Minimal Dot */}
              <div
                className={`
                                    w-3 h-3 rounded-full flex items-center justify-center transition-all duration-700
                                    ${
                                      isCompleted
                                        ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                        : isCurrent
                                          ? "bg-white scale-125 shadow-[0_0_25px_rgba(255,255,255,0.8)] ring-4 ring-indigo-500/20"
                                          : "bg-slate-800 border border-white/10"
                                    }
                                `}
              ></div>

              {/* Label - Clean & Spaced */}
              <span
                className={`
                                    absolute top-8 text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap font-sans
                                    ${
                                      isCurrent
                                        ? "text-white translate-y-0 opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        : isCompleted
                                          ? "text-indigo-300/70 opacity-80"
                                          : "text-slate-600 opacity-40"
                                    }
                                `}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(WorkflowStepper);
