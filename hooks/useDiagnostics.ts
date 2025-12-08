import { useState, useCallback } from "react";

interface DiagnosticMessage {
  timestamp: Date;
  message: string;
  data?: any;
}

export const useDiagnostics = () => {
  const [messages, setMessages] = useState<DiagnosticMessage[]>([]);

  const addDiagnostic = useCallback(
    (message: string, data?: any) => {
      setMessages((prev) => [...prev, { timestamp: new Date(), message, data }]);
      // Optional: Keep the log from getting too big
      if (messages.length > 100) {
        setMessages((prev) => prev.slice(-100));
      }
    },
    [messages.length]
  );

  const clearDiagnostics = useCallback(() => {
    setMessages([]);
  }, []);

  return { diagnosticMessages: messages, addDiagnostic, clearDiagnostics };
};
