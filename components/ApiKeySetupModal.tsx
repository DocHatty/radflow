import React, { useState } from "react";
import { motion } from "framer-motion";
import ActionButton from "./ActionButton";
import { EyeIcon, EyeSlashIcon } from "./Icons";

interface ApiKeySetupModalProps {
  onComplete: (apiKey: string) => void;
}

const ApiKeySetupModal: React.FC<ApiKeySetupModalProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    onComplete(apiKey.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-900/20 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <svg
                className="w-8 h-8 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome to RadFlow
            </h2>
            <p className="text-sm text-slate-400">
              To get started, please enter your Google Gemini API key
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 space-y-2">
            <p className="text-xs text-blue-200 font-semibold">
              How to get your API key:
            </p>
            <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
              <li>
                Visit{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click "Get API Key" or "Create API Key"</li>
              <li>Copy the key and paste it below</li>
            </ol>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="w-full p-3 pr-10 text-sm rounded-md bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                placeholder="AIzaSy..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {isVisible ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Security Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
            <p className="text-xs text-amber-200">
              <span className="font-semibold">Security Note:</span> Your API key
              will be stored securely in your browser's local storage and never
              sent to any server except Google's API.
            </p>
          </div>

          {/* Submit Button */}
          <ActionButton
            onClick={handleSubmit}
            className="w-full justify-center py-3 text-base font-semibold"
          >
            Continue
          </ActionButton>

          {/* Additional Info */}
          <p className="text-xs text-center text-slate-500">
            You can change this later in Settings
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiKeySetupModal;
