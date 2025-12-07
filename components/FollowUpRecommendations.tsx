import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateFollowUpRecommendations, FollowUpRecommendation } from "../utils/followUpEngine";
import { ClockIcon, AlertTriangleIcon, CalendarIcon } from "./Icons";

interface FollowUpRecommendationsProps {
  reportContent: string;
  className?: string;
}

const FollowUpRecommendations: React.FC<FollowUpRecommendationsProps> = ({
  reportContent,
  className = "",
}) => {
  const recommendations = useMemo(
    () => generateFollowUpRecommendations(reportContent),
    [reportContent]
  );

  if (recommendations.length === 0) {
    return null;
  }

  const getUrgencyStyles = (urgency: FollowUpRecommendation["urgency"]) => {
    switch (urgency) {
      case "urgent":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-300",
          icon: "text-red-400",
        };
      case "short-term":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-300",
          icon: "text-yellow-400",
        };
      case "routine":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-200">
            Follow-up Recommendations
          </h3>
          <span className="text-xs text-gray-400">
            ({recommendations.length} finding{recommendations.length > 1 ? "s" : ""})
          </span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {recommendations.map((rec, idx) => {
              const styles = getUrgencyStyles(rec.urgency);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-md border ${styles.border} ${styles.bg} p-2.5`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {rec.urgency === "urgent" ? (
                        <AlertTriangleIcon className={`h-4 w-4 ${styles.icon}`} />
                      ) : (
                        <ClockIcon className={`h-4 w-4 ${styles.icon}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-medium ${styles.text}`}>
                          {rec.finding}
                        </p>
                        {rec.timeframe && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 shrink-0">
                            {rec.timeframe}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mb-1">
                        {rec.recommendation}
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        {rec.guideline}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-3 pt-2 border-t border-indigo-500/20">
          <p className="text-xs text-gray-400">
            💡 These recommendations are based on established radiology guidelines
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FollowUpRecommendations;
