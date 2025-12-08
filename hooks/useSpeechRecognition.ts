import { useState, useEffect, useRef, useCallback } from "react";
import { logError, logEvent } from "../services/loggingService";
import { medicalTerms } from "../lib/medicalTerms";

// Polyfill for browser compatibility
const SpeechRecognition: SpeechRecognitionStatic | undefined =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarListConstructor: SpeechGrammarListStatic | undefined =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechRecognitionSupported = !!SpeechRecognition;

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      logError("SpeechRecognition", {
        error: "Not supported in this browser.",
      });
      return;
    }

    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setMicPermission(permissionStatus.state);
        logEvent("Microphone Permission State", {
          state: permissionStatus.state,
        });
        permissionStatus.onchange = () => {
          logEvent("Microphone Permission State Changed", {
            state: permissionStatus.state,
          });
          setMicPermission(permissionStatus.state);
        };
      } catch (e) {
        logError("Microphone Permission Query", { error: e });
      }
    };
    checkPermission();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Add medical terminology grammar hints
    if (SpeechGrammarListConstructor) {
      try {
        const grammarList = new SpeechGrammarListConstructor();
        const terms = Array.from(medicalTerms).join(" | ");
        const grammar = `#JSGF V1.0; grammar medical; public <term> = ${terms} ;`;
        grammarList.addFromString(grammar, 1);
        recognition.grammars = grammarList;
        logEvent("Medical terminology grammar loaded for speech recognition");
      } catch (e) {
        logError("Failed to load medical grammar", { error: e });
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;
        if (result.isFinal) {
          finalChunk += transcriptPart;
        } else {
          currentInterim += transcriptPart;
        }
      }

      if (finalChunk.trim()) {
        setFinalTranscript((prev) => (prev.trim() ? prev.trim() + " " : "") + finalChunk.trim());
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        logError("Speech Recognition Error", {
          error: event.error,
          message: event.message,
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript(""); // Clear interim on stop
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isSpeechRecognitionSupported]);

  const startListening = useCallback(() => {
    // Allow starting if permission is granted OR prompt (to trigger the browser prompt)
    if (recognitionRef.current && !isListening && micPermission !== "denied") {
      try {
        setFinalTranscript(""); // Clear previous final transcripts on start
        recognitionRef.current.start();
        setIsListening(true);
        logEvent("Speech Recognition Started");
      } catch (e) {
        logError("Error starting speech recognition", { error: e });
        setIsListening(false);
      }
    } else {
      logEvent("Speech Recognition Start Blocked", {
        isListening,
        micPermission,
      });
    }
  }, [isListening, micPermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      logEvent("Speech Recognition Stopped");
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    finalTranscript,
    interimTranscript,
    micPermission,
    isSpeechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};
