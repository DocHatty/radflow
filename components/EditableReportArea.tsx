import React, { useRef, useEffect, useState, useMemo } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import Panel from "./Panel";
import ActionButton from "./ActionButton";
import SecondaryButton from "./SecondaryButton";
import LoadingSpinner from "./LoadingSpinner";
import IconButton from "./IconButton";
import {
  MicIcon,
  CopyIcon,
  CheckIcon as CheckmarkIcon,
  SparklesIcon,
} from "./Icons";
import { useWorkflowStore } from '../App';
import { applySyntaxHighlighting } from "../utils/syntaxHighlighter";
import { saveCaretPosition, restoreCaretPosition } from "../utils/caretUtils";
import { htmlToText, textToHtml } from "../utils/textUtils";
import CriticalFindingsAlert from "./CriticalFindingsAlert";
import { detectCriticalFindings } from "../utils/criticalFindingsDetector";
import ReportCompletionEstimator from "./ReportCompletionEstimator";

const ReportToolbar: React.FC<{
  isAnyLoading: boolean;
  isCopied: boolean;
  content: string;
  handleCopy: () => void;
  isSpeechRecognitionSupported: boolean;
  micPermission: string;
  isListening: boolean;
  toggleListening: () => void;
  onFinalReview: () => void;
  isFinalReviewLoading: boolean;
}> = ({
  isAnyLoading,
  isCopied,
  content,
  handleCopy,
  isSpeechRecognitionSupported,
  micPermission,
  isListening,
  toggleListening,
  onFinalReview,
  isFinalReviewLoading,
}) => (
  <div className="flex items-center space-x-2">
    <IconButton
      onClick={handleCopy}
      disabled={isAnyLoading || !content}
      title="Copy Report"
      aria-label="Copy Report"
    >
      {isCopied ? (
        <CheckmarkIcon className="h-5 w-5 text-(--color-success-text)" />
      ) : (
        <CopyIcon className="h-5 w-5" />
      )}
    </IconButton>
    {isSpeechRecognitionSupported && micPermission === "granted" && (
      <IconButton
        onClick={toggleListening}
        disabled={isAnyLoading && !isListening}
        title={isListening ? "Stop Dictation" : "Start Dictation"}
        aria-label={isListening ? "Stop dictation" : "Start dictation"}
        className={`${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : ""}`}
      >
        <MicIcon isListening={isListening} />
      </IconButton>
    )}
    <ActionButton
      onClick={onFinalReview}
      isLoading={isFinalReviewLoading}
      disabled={isAnyLoading || !content.trim()}
    >
      {isFinalReviewLoading ? "Reviewing..." : "Final Review →"}
    </ActionButton>
  </div>
);

const EditableReportArea: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [dictationInput, setDictationInput] = useState(""); // New state for the dictation box

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

  const {
    rawContent,
    onContentChange,
    activeProcess,
    onReviseBrief,
    onIntegrateDictation,
    onFinalReview,
  } = useWorkflowStore((state) => ({
    rawContent: state.editableReportContent,
    onContentChange: state.setEditableReportContent,
    activeProcess: state.activeProcess,
    onReviseBrief: state.reviseBrief,
    onIntegrateDictation: state.integrateDictation,
    onFinalReview: state.fetchFinalReview,
  }));

  // Detect critical findings in the report
  const criticalFindings = useMemo(() => {
    return detectCriticalFindings(rawContent + " " + dictationInput);
  }, [rawContent, dictationInput]);

  const isLoading = activeProcess === "generating";
  const isRefining = activeProcess === "refining";
  const isIntegrating = activeProcess === "integrating";
  const isFinalReviewActive = activeProcess === "fetchingFinalReview";
  const isApplyingChanges = activeProcess === "applyingChanges";
  const isAnyLoading =
    isLoading ||
    isRefining ||
    isIntegrating ||
    isFinalReviewActive ||
    isApplyingChanges;

  // Synchronize editor display
  useEffect(() => {
    const editor = divRef.current;
    if (!editor) return;
    const caretPos = saveCaretPosition(editor);
    const safeHtml = textToHtml(rawContent);
    const newlyHighlightedHtml = applySyntaxHighlighting(safeHtml);
    setHighlightedHtml(newlyHighlightedHtml);
    queueMicrotask(() => {
      if (divRef.current) {
        restoreCaretPosition(divRef.current, caretPos);
      }
    });
  }, [rawContent]);

  // Handle Speech Transcript - Append to Dictation Box instead of auto-integrating
  useEffect(() => {
    if (finalTranscript) {
      setDictationInput((prev) => prev + (prev ? " " : "") + finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  const handleCopy = () => {
    if (divRef.current?.innerText) {
      navigator.clipboard.writeText(divRef.current.innerText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleUpdateReport = () => {
    if (dictationInput.trim()) {
      onIntegrateDictation(dictationInput);
      setDictationInput(""); // Clear after sending
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const cleanText = htmlToText(e.currentTarget.innerHTML);
    onContentChange(cleanText);
  };

  return (
    <Panel
      title="AI Generated Report Draft"
      actions={
        <ReportToolbar
          isAnyLoading={isAnyLoading}
          isCopied={isCopied}
          content={rawContent}
          handleCopy={handleCopy}
          isSpeechRecognitionSupported={isSpeechRecognitionSupported}
          micPermission={micPermission}
          isListening={isListening}
          toggleListening={toggleListening}
          onFinalReview={onFinalReview}
          isFinalReviewLoading={isFinalReviewActive}
        />
      }
      footer={
        <div className="flex justify-start">
          <SecondaryButton onClick={onReviseBrief} disabled={isAnyLoading}>
            &larr; Revise Clinical Brief
          </SecondaryButton>
        </div>
      }
      className="h-full flex flex-col"
      bodyClassName="p-0 flex-1 flex flex-col min-h-0" // Ensure flex layout for body
    >
      {/* Report Completion Estimator & Critical Findings Alert */}
      <div className="p-4 pb-0 space-y-3">
        <ReportCompletionEstimator reportContent={rawContent} />
        {criticalFindings.length > 0 && (
          <CriticalFindingsAlert findings={criticalFindings} />
        )}
      </div>

      {/* Main Editor Area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {(isLoading || isRefining) && !rawContent && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-transparent z-10">
            <LoadingSpinner className="h-10 w-10 text-(--color-primary)" />
            <p className="mt-4 text-sm text-(--color-text-muted)">
              {isLoading
                ? "Generating initial report draft..."
                : "Refining report..."}
            </p>
          </div>
        )}
        <div
          ref={divRef}
          contentEditable={!isAnyLoading}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          data-placeholder="Report content will appear here..."
          className="glass-input bg-transparent border-none rounded-none report-font w-full h-full p-4 focus:outline-none resize-none text-(--color-text-default) text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap"
          role="textbox"
          aria-multiline="true"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        {(isIntegrating || isApplyingChanges) && (
          <div className="absolute bottom-2 right-2 text-xs text-(--color-primary) bg-(--color-panel-bg) px-2 py-1 rounded shadow-lg">
            {isIntegrating
              ? "Integrating dictation..."
              : "Applying recommendations..."}
          </div>
        )}
      </div>

      {/* Dictation / Instruction Box */}
      <div className="p-4 border-t border-white/10 bg-slate-900/40 backdrop-blur-md">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-indigo-300/80 uppercase tracking-widest">
              Dictation & Instructions
            </label>
            {isListening && (
              <div className="flex items-center space-x-2 text-xs text-red-400 animate-pulse bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                <MicIcon isListening={true} className="h-3 w-3" />
                <span>Listening...</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <textarea
                value={
                  isListening
                    ? dictationInput +
                      (dictationInput && interimTranscript ? " " : "") +
                      interimTranscript
                    : dictationInput
                }
                onChange={(e) => setDictationInput(e.target.value)}
                placeholder="Dictate findings (e.g., 'There is a 5mm cyst') or instructions (e.g., 'Remove the cyst mention')..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none h-24 placeholder-slate-600 shadow-inner"
                disabled={isAnyLoading}
              />
              {/* Removed floating badge as text now streams directly into the box */}
            </div>

            <div className="flex flex-col gap-2 justify-start shrink-0">
              {isSpeechRecognitionSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isAnyLoading}
                  className={`h-11 w-11 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-lg ${
                    isListening
                      ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600"
                  }`}
                  title={isListening ? "Stop Dictation" : "Start Dictation"}
                >
                  <MicIcon isListening={isListening} className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleUpdateReport}
                disabled={isAnyLoading || !dictationInput.trim()}
                className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center border border-indigo-400/20"
                title="Update Report"
              >
                <SparklesIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default EditableReportArea;
