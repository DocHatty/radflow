import React, { useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { AllClearIcon, SparklesIcon, SendIcon, MicIcon, UserIcon, AiIcon } from "./Icons";
import ActionButton from "./ActionButton";
import SecondaryButton from "./SecondaryButton";
import IconButton from "./IconButton";
import { useWorkflowStore } from "../App";
import GuidelineReference from "../guidelines/GuidelineReference";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { parseMarkdownToHTML } from "../utils/textUtils";

const InteractiveRecommendations: React.FC<{
  recommendations: string[];
  onApply: (recommendations: string[]) => Promise<void>;
}> = ({ recommendations, onApply }) => {
  const [localLoading, setLocalLoading] = useState<"all" | number | null>(null);
  const activeProcess = useWorkflowStore((state) => state.activeProcess);
  const isBusy = activeProcess === "applyingChanges";

  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-(--color-text-muted)">No specific recommendations provided.</p>
    );
  }

  const handleApply = async (index: number) => {
    setLocalLoading(index);
    await onApply([recommendations[index]]);
    setLocalLoading(null);
  };

  const handleApplyAll = async () => {
    setLocalLoading("all");
    await onApply(recommendations);
    setLocalLoading(null);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li
            key={index}
            className="p-3 rounded-md bg-(--color-interactive-bg)/50 border border-(--color-border) flex items-start justify-between gap-3 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-sm grow pt-1.5">{rec}</p>
            <SecondaryButton
              onClick={() => handleApply(index)}
              disabled={isBusy}
              className="!bg-(--color-secondary)/10 !text-(--color-secondary) hover:!bg-(--color-secondary)/20 hover:!text-white shrink-0"
            >
              {localLoading === index && <LoadingSpinner className="mr-1.5 h-4 w-4" />}
              Apply
            </SecondaryButton>
          </li>
        ))}
      </ul>
      {recommendations.length > 1 && (
        <div className="pt-4 border-t border-(--color-border) flex justify-end">
          <ActionButton
            onClick={handleApplyAll}
            isLoading={localLoading === "all"}
            disabled={isBusy}
          >
            <SparklesIcon className="mr-2 h-5 w-5" />
            Apply All Recommendations
          </ActionButton>
        </div>
      )}
    </div>
  );
};

const QAChat: React.FC = () => {
  // Use useShallow to prevent unnecessary re-renders
  const { qaHistory, submitQuery, activeProcess } = useWorkflowStore(
    useShallow((state) => ({
      qaHistory: state.qaHistory,
      submitQuery: state.submitQuery,
      activeProcess: state.activeProcess,
    }))
  );
  const [query, setQuery] = useState("");
  const {
    isListening,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isQuerying = activeProcess === "querying";

  useEffect(() => {
    if (finalTranscript) {
      setQuery((prev) => (prev.trim() ? prev.trim() + " " : "") + finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [qaHistory, isQuerying]);

  const handleSubmit = () => {
    if (query.trim()) {
      submitQuery(query);
      setQuery("");
    }
  };

  const toggleListening = () => (isListening ? stopListening() : startListening());

  const liveQuery =
    query +
    (interimTranscript ? (query.endsWith(" ") || !query ? "" : " ") + interimTranscript : "");

  return (
    <div className="pt-4 mt-4 border-t border-(--color-border) flex flex-col h-full">
      <div className="grow overflow-y-auto space-y-4 pr-2">
        {qaHistory.map((item, index) => {
          const isUser = item.role === "user";
          const isStreaming = isQuerying && index === qaHistory.length - 1;
          return (
            <div key={index} className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
              {!isUser && (
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-(--color-secondary)/20 text-(--color-secondary)">
                  <AiIcon className="w-5 h-5" />
                </div>
              )}
              <div
                className={`p-3 rounded-lg text-sm max-w-md ${isUser ? "bg-(--color-primary)/10 text-(--color-text-default)" : "bg-(--color-interactive-bg)"}`}
              >
                <div
                  className="prose prose-sm prose-invert"
                  dangerouslySetInnerHTML={{
                    __html:
                      parseMarkdownToHTML(item.content) ||
                      (isStreaming ? '<span class="animate-pulse">...</span>' : ""),
                  }}
                />
              </div>
              {isUser && (
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-(--color-interactive-bg-hover) text-(--color-text-bright)">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="relative shrink-0 pt-2 flex items-center space-x-2 mt-2">
        <textarea
          value={isListening ? liveQuery : query}
          onChange={(e) => {
            if (isListening) stopListening();
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask a follow-up question..."
          className="glass-input w-full p-2.5 pr-20 rounded-lg focus:outline-none resize-none text-sm transition-shadow duration-200 text-(--color-text-default) disabled:opacity-50"
          rows={1}
          disabled={isQuerying}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          <IconButton
            onClick={toggleListening}
            disabled={isQuerying}
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
            className={`border-none ${isListening ? "text-red-400" : ""}`}
          >
            <MicIcon isListening={isListening} />
          </IconButton>
          <IconButton
            onClick={handleSubmit}
            disabled={isQuerying || !query.trim()}
            aria-label="Send Query"
            className="bg-(--color-primary)/20 text-(--color-primary) hover:bg-(--color-primary)/30 border-none"
          >
            <SendIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export const FinalReviewPanel: React.FC = () => {
  const { recommendations, isLoading, isAllClear, applyRecommendations, activeGuidelines } =
    useWorkflowStore((state) => ({
      recommendations: state.finalReviewContent,
      isLoading: state.activeProcess === "fetchingFinalReview",
      isAllClear: state.isFinalReviewAllClear,
      applyRecommendations: state.applyRecommendations,
      activeGuidelines: state.activeGuidelines,
    }));

  const showReviewContent = !isLoading && (recommendations.length > 0 || isAllClear);

  const renderPanelContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center">
          <LoadingSpinner className="w-10 h-10 text-(--color-primary)" />
          <p className="mt-3 text-sm text-(--color-text-muted)">
            Performing final quality assurance check...
          </p>
        </div>
      );
    }

    if (isAllClear) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-full animate-fade-in">
          <AllClearIcon />
          <h4 className="text-2xl font-bold text-green-300 mt-4">All Clear</h4>
          <p className="text-md text-green-400/80 mt-1 max-w-xs">
            AI analysis found no critical issues. The report appears consistent with clinical
            context and guidelines.
          </p>
        </div>
      );
    }

    if (recommendations.length > 0) {
      return (
        <InteractiveRecommendations
          recommendations={recommendations}
          onApply={applyRecommendations}
        />
      );
    }

    return (
      <EmptyState message="The AI will provide a final quality check here, comparing the report against guidelines and the clinical brief." />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className={showReviewContent ? "shrink-0" : "grow flex flex-col"}>
        <div className="grow">{renderPanelContent()}</div>
        {activeGuidelines.length > 0 && (
          <div className="pt-4 mt-auto">
            <GuidelineReference guidelines={activeGuidelines} />
          </div>
        )}
      </div>
      {showReviewContent && (
        <div className="grow min-h-0">
          <QAChat />
        </div>
      )}
    </div>
  );
};
