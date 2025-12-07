import { useCallback, useEffect, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { parseVoiceCommand, VoiceCommand } from "../utils/voiceCommandParser";
import { logEvent } from "../services/loggingService";

export interface UseSpeechCommandsResult {
  // Speech recognition properties
  isListening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  micPermission: "prompt" | "granted" | "denied";
  isSpeechRecognitionSupported: boolean;
  
  // Speech recognition actions
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  
  // Command-specific properties
  lastCommand: VoiceCommand | null;
  clearLastCommand: () => void;
}

export const useSpeechCommands = (): UseSpeechCommandsResult => {
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  
  const speechRecognition = useSpeechRecognition();
  const { finalTranscript, resetTranscript } = speechRecognition;
  
  // Check for voice commands in the final transcript
  useEffect(() => {
    if (finalTranscript) {
      const command = parseVoiceCommand(finalTranscript);
      if (command) {
        logEvent("Voice Command Detected", { 
          command: command.type, 
          parameter: command.parameter 
        });
        setLastCommand(command);
        // Don't reset transcript here - let the consumer handle it
      }
    }
  }, [finalTranscript]);
  
  const clearLastCommand = useCallback(() => {
    setLastCommand(null);
  }, []);
  
  return {
    ...speechRecognition,
    lastCommand,
    clearLastCommand,
  };
};
