import React, { useRef, useEffect } from "react";
import { useWorkflowStore } from "../App";
import { XIcon, TrashIcon } from "./Icons";

const DiagnosticsPanel: React.FC = () => {
  const { messages, isDiagnosticsPanelOpen, toggleDiagnosticsPanel, clearDiagnostics } =
    useWorkflowStore((state) => ({
      messages: state.diagnosticMessages,
      isDiagnosticsPanelOpen: state.isDiagnosticsPanelOpen,
      toggleDiagnosticsPanel: state.toggleDiagnosticsPanel,
      clearDiagnostics: state.clearDiagnostics,
    }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDiagnosticsPanelOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isDiagnosticsPanelOpen]);

  if (!isDiagnosticsPanelOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-(--color-border) rounded-lg shadow-2xl z-50 w-full max-w-lg h-96 flex flex-col animate-slide-in-bottom">
      <header className="flex items-center justify-between p-3 border-b border-(--color-secondary)/30 shrink-0">
        <h3 className="font-semibold text-sm text-(--color-text-muted)">Diagnostics Log</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearDiagnostics}
            title="Clear Log"
            className="p-1 text-(--color-text-muted) hover:text-white transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={toggleDiagnosticsPanel}
            title="Close"
            className="p-1 text-(--color-text-muted) hover:text-white transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="p-3 overflow-y-auto grow font-mono text-xs">
        {messages.length === 0 ? (
          <div className="text-(--color-text-muted) italic">Log is empty.</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`py-1 border-b border-(--color-border)/50 ${msg.type === "error" ? "text-(--color-danger-text)" : "text-(--color-text-default)"}`}
            >
              <span className="text-(--color-primary) opacity-80 mr-2">
                {msg.timestamp.toLocaleTimeString()}
              </span>
              <span>{msg.message}</span>
              {msg.data && (
                <pre className="text-(--color-text-muted) text-xs whitespace-pre-wrap pl-4 mt-1 opacity-70">
                  {msg.data}
                </pre>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
