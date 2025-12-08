import { useWorkflowStore } from "../App";

/**
 * Logs a standard event to the console and the diagnostics panel.
 * @param eventName A descriptive name for the event.
 * @param data Optional additional data to log.
 */
export const logEvent = (eventName: string, data?: Record<string, any>): void => {
  console.log(`[EVENT] ${eventName}`, data || "");
  useWorkflowStore.getState().addDiagnostic("log", eventName, data);
};

/**
 * Logs an error to the console and the diagnostics panel.
 * @param context A string describing where the error occurred.
 * @param errorData The error object or a data object containing error info.
 */
export const logError = (context: string, errorData: Record<string, any>): void => {
  console.error(`[ERROR] ${context}:`, errorData);
  useWorkflowStore.getState().addDiagnostic("error", context, errorData);
};
