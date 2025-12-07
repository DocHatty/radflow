import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicIcon, InfoIcon } from "./Icons";

const VoiceCommandsHelp: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const commands = [
    { command: "Normal [body part]", example: "Normal chest", description: "Insert normal template" },
    { command: "Insert normal [study]", example: "Insert normal abdomen CT", description: "Insert study template" },
    { command: "New paragraph", example: "New paragraph", description: "Add paragraph break" },
    { command: "Clear text", example: "Clear all text", description: "Clear dictation box" },
    { command: "Compare to prior", example: "Compared to prior", description: "Reference prior study" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-indigo-300/60 hover:text-indigo-300 transition-colors"
      >
        <MicIcon className="h-3 w-3" />
        <span>Voice Commands</span>
        <InfoIcon className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 bg-slate-800/95 backdrop-blur-md border border-indigo-500/30 rounded-lg shadow-xl p-3 min-w-[320px] z-50"
          >
            <div className="mb-2 pb-2 border-b border-indigo-500/20">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                Available Voice Commands
              </h4>
            </div>
            <div className="space-y-2">
              {commands.map((cmd, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono font-medium shrink-0">
                      "{cmd.command}"
                    </span>
                  </div>
                  <div className="text-gray-400 mt-0.5 ml-0">
                    {cmd.description}
                  </div>
                  {cmd.example && (
                    <div className="text-gray-500 italic text-[10px] mt-0.5 ml-0">
                      e.g., "{cmd.example}"
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-500/20">
              <p className="text-[10px] text-gray-400">
                💡 Speak clearly and pause briefly after commands
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCommandsHelp;
