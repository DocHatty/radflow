import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CriticalFinding } from "../utils/criticalFindingsDetector";
import { AlertTriangleIcon, XIcon, BellIcon } from "./Icons";

interface CriticalFindingsAlertProps {
  findings: CriticalFinding[];
  onDismiss?: () => void;
  enableSound?: boolean;
}

const CriticalFindingsAlert: React.FC<CriticalFindingsAlertProps> = ({
  findings,
  onDismiss,
  enableSound = true,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const hasCritical = findings.some(f => f.severity === "critical");
  const hasUrgent = findings.some(f => f.severity === "urgent");

  useEffect(() => {
    if (findings.length > 0 && !soundPlayed && enableSound) {
      // Play alert sound for critical findings
      if (hasCritical) {
        playAlertSound("critical");
      } else if (hasUrgent) {
        playAlertSound("urgent");
      }
      setSoundPlayed(true);
    }
  }, [findings.length, soundPlayed, enableSound, hasCritical, hasUrgent]);

  const playAlertSound = (type: "critical" | "urgent") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different severity
      oscillator.frequency.value = type === "critical" ? 800 : 600;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Failed to play alert sound:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (findings.length === 0 || dismissed) return null;

  const criticalFindings = findings.filter(f => f.severity === "critical");
  const urgentFindings = findings.filter(f => f.severity === "urgent");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-lg border-2 p-4 mb-4 ${
          hasCritical
            ? "bg-red-900/20 border-red-500 shadow-lg shadow-red-500/50"
            : "bg-yellow-900/20 border-yellow-500 shadow-lg shadow-yellow-500/30"
        }`}
      >
        {/* Alert Icon and Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={hasCritical ? "animate-pulse" : ""}>
              <AlertTriangleIcon
                className={`h-6 w-6 ${
                  hasCritical ? "text-red-400" : "text-yellow-400"
                }`}
              />
            </div>
            <h3
              className={`font-bold text-lg ${
                hasCritical ? "text-red-300" : "text-yellow-300"
              }`}
            >
              {hasCritical ? "⚠️ CRITICAL FINDINGS DETECTED" : "⚡ Urgent Findings Detected"}
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Dismiss alert"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Critical Findings */}
        {criticalFindings.length > 0 && (
          <div className="mb-3">
            <h4 className="text-red-300 font-semibold mb-2 text-sm uppercase tracking-wide">
              Critical ({criticalFindings.length})
            </h4>
            <ul className="space-y-1">
              {criticalFindings.map((finding, idx) => (
                <li
                  key={`critical-${idx}`}
                  className="text-red-200 text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="font-medium">{finding.type}</span>
                  <span className="text-red-400/70">"{finding.matched}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Urgent Findings */}
        {urgentFindings.length > 0 && (
          <div>
            <h4 className="text-yellow-300 font-semibold mb-2 text-sm uppercase tracking-wide">
              Urgent ({urgentFindings.length})
            </h4>
            <ul className="space-y-1">
              {urgentFindings.map((finding, idx) => (
                <li
                  key={`urgent-${idx}`}
                  className="text-yellow-200 text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="font-medium">{finding.type}</span>
                  <span className="text-yellow-400/70">"{finding.matched}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Reminder */}
        <div
          className={`mt-4 pt-3 border-t ${
            hasCritical ? "border-red-500/30" : "border-yellow-500/30"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <BellIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">
              Remember to communicate critical findings immediately to the referring provider
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CriticalFindingsAlert;
