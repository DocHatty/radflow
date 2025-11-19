// This file provides missing type definitions for the Web Speech API,
// making them globally available in the project to prevent TypeScript errors.

declare global {
    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message: string;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onend: (() => void) | null;
        onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        start(): void;
        stop(): void;
    }

    interface SpeechRecognitionStatic {
        new(): SpeechRecognition;
    }
    
    interface Window {
        SpeechRecognition?: SpeechRecognitionStatic;
        webkitSpeechRecognition?: SpeechRecognitionStatic;
    }
}

// This export statement is necessary to make this file a module,
// which is required for the `declare global` block to work correctly.
export {};
