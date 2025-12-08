import React from "react";
import InputArea from "../InputArea";
import { useWorkflowStore } from "../../App";
import ActionButton from "../ActionButton";

const InputStage: React.FC = () => {
  const {
    contrastClarificationNeeded,
    resolveContrastClarification,
    examDateInput,
    setExamDateInput,
  } = useWorkflowStore((state) => ({
    contrastClarificationNeeded: state.contrastClarificationNeeded,
    resolveContrastClarification: state.resolveContrastClarification,
    examDateInput: state.examDateInput,
    setExamDateInput: state.setExamDateInput,
  }));

  if (contrastClarificationNeeded) {
    return (
      <div className="w-full max-w-3xl p-4 animate-fade-in text-center glass-panel">
        <h3 className="text-lg font-semibold text-(--color-text-bright) mb-2">
          Clarification Needed
        </h3>
        <p className="text-(--color-text-muted) mb-4">
          The study type{" "}
          <strong className="text-(--color-text-default)">
            "{contrastClarificationNeeded.studyType}"
          </strong>{" "}
          is ambiguous. Please specify the use of contrast.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
          <ActionButton onClick={() => resolveContrastClarification("without contrast")}>
            Without Contrast
          </ActionButton>
          <ActionButton onClick={() => resolveContrastClarification("with contrast")}>
            With Contrast
          </ActionButton>
          <ActionButton onClick={() => resolveContrastClarification("with and without contrast")}>
            With & Without
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl p-4 animate-fade-in space-y-4">
      <div className="glass-panel p-4">
        <label
          htmlFor="examDate"
          className="block text-xs font-bold uppercase text-(--color-secondary) tracking-wider mb-2"
        >
          Date & Time of Study
        </label>
        <input
          id="examDate"
          type="text"
          value={examDateInput}
          onChange={(e) => setExamDateInput(e.target.value)}
          className="glass-input w-full bg-transparent p-3 rounded-lg focus:outline-none transition-shadow duration-200 text-(--color-text-bright) font-semibold"
          placeholder="YYYY-MM-DD HH:mm"
        />
      </div>
      <InputArea
        placeholder="Paste or type clinical information... (e.g., 'MRI Brain w/wo contrast for new onset seizure...')"
        buttonText="Analyze Clinical Info"
      />
    </div>
  );
};

export default InputStage;
