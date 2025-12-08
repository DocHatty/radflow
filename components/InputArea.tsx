import React, { KeyboardEvent, useEffect } from "react";
import ActionButton from "./ActionButton";
import { useWorkflowStore } from "../App";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { MicIcon } from "./Icons";

interface InputAreaProps {
  isDisabled?: boolean;
  buttonText?: string;
  placeholder?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ isDisabled, buttonText, placeholder }) => {
  const { userInput, setUserInput, submitInput, isAiReady, activeProcess } = useWorkflowStore(
    (state) => ({
      userInput: state.userInput,
      setUserInput: state.setUserInput,
      submitInput: state.submitInput,
      isAiReady: state.isAiReady,
      activeProcess: state.activeProcess,
    })
  );

  const {
    isListening,
    finalTranscript,
    interimTranscript,
    micPermission,
    isSpeechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const isLoading = activeProcess === "categorizing";

  useEffect(() => {
    if (finalTranscript) {
      const currentInput = userInput;
      const newInput = (currentInput.trim() ? currentInput.trim() + " " : "") + finalTranscript;
      setUserInput(newInput);
      resetTranscript();
    }
  }, [finalTranscript, userInput, setUserInput, resetTranscript]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key inserts a tab character instead of moving focus
    if (event.key === "Tab") {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = userInput.substring(0, start) + "\t" + userInput.substring(end);
      setUserInput(newValue);
      // Set cursor position after the tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!isDisabled) submitInput();
    }
  };

  if (isDisabled) {
    return null;
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const liveValue =
    userInput +
    (interimTranscript
      ? (userInput.endsWith(" ") || !userInput ? "" : " ") + interimTranscript
      : "");

  return (
    <div className="relative panel-base animate-fade-in p-0">
      <textarea
        value={isListening ? liveValue : userInput}
        onChange={(e) => {
          if (isListening) stopListening();
          setUserInput(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ||
          (isAiReady
            ? "Paste radiology modality type and any pertinent clinical info available.\n\nPlease do not include any PHI. Be responsible, as this is experimental and uses cloud resources.\n\n(Cmd/Ctrl + Enter to Submit)"
            : "Initializing AI model...")
        }
        className="glass-input w-full bg-transparent border-none h-64 p-4 pr-12 pb-16 rounded-lg focus:outline-none resize-none transition-shadow duration-200 text-(--color-text-default) disabled:opacity-50"
        disabled={isLoading || !isAiReady || isDisabled}
      />
      {isListening && interimTranscript && (
        <span className="absolute top-4 left-4 text-(--color-text-muted) opacity-50 pointer-events-none whitespace-pre-wrap">
          {liveValue}
        </span>
      )}
      <div className="absolute right-4 bottom-4 flex items-center space-x-2">
        {isSpeechRecognitionSupported && micPermission === "granted" && (
          <button
            onClick={toggleListening}
            disabled={isLoading || !isAiReady}
            title={isListening ? "Stop Dictation" : "Start Dictation"}
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
            className={`p-3 rounded-full transition-all duration-300 ${isListening ? "bg-red-500/20 animate-pulse text-red-400" : "text-(--color-text-muted) hover:bg-(--color-interactive-bg-hover) hover:text-white"}`}
          >
            <MicIcon isListening={isListening} />
          </button>
        )}
        <ActionButton
          onClick={submitInput}
          isLoading={isLoading}
          disabled={isLoading || !userInput.trim() || !isAiReady || isDisabled}
        >
          {isLoading ? "Processing..." : buttonText || "Submit"}
        </ActionButton>
      </div>
    </div>
  );
};

export default InputArea;
