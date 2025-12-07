import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateCompletionMetrics, getCompletionLevel } from "../utils/reportCompletion";
import { ActivityIcon, CheckCircleIcon } from "./Icons";

interface ReportCompletionEstimatorProps {
  reportContent: string;
  className?: string;
}

const ReportCompletionEstimator: React.FC<ReportCompletionEstimatorProps> = ({
  reportContent,
  className = "",
}) => {
  const metrics = useMemo(() => calculateCompletionMetrics(reportContent), [reportContent]);
  const completionInfo = useMemo(() => getCompletionLevel(metrics.overallScore), [metrics.overallScore]);

  // Don't show if report is empty
  if (!reportContent.trim() || metrics.overallScore === 0) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500",
          text: "text-emerald-300",
          fill: "bg-emerald-500",
        };
      case "blue":
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-500",
          text: "text-blue-300",
          fill: "bg-blue-500",
        };
      case "yellow":
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500",
          text: "text-yellow-300",
          fill: "bg-yellow-500",
        };
      case "red":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500",
          text: "text-red-300",
          fill: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-500/20",
          border: "border-gray-500",
          text: "text-gray-300",
          fill: "bg-gray-500",
        };
    }
  };

  const colors = getColorClasses(completionInfo.color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${className}`}
    >
      <div className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ActivityIcon className={`h-4 w-4 ${colors.text}`} />
            <span className="text-sm font-semibold text-gray-200">
              Report Completeness
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${colors.text}`}>
              {metrics.overallScore}%
            </span>
            {metrics.overallScore >= 90 && (
              <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.overallScore}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute inset-y-0 left-0 ${colors.fill} rounded-full`}
          />
        </div>

        {/* Status Message */}
        <p className="text-xs text-gray-300 mb-2">{completionInfo.message}</p>

        {/* Missing Elements */}
        {metrics.missingElements.length > 0 && metrics.overallScore < 90 && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Consider adding:</p>
            <div className="flex flex-wrap gap-1">
              {metrics.missingElements.slice(0, 4).map((element, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded-full"
                >
                  {element}
                </span>
              ))}
              {metrics.missingElements.length > 4 && (
                <span className="text-xs px-2 py-0.5 text-gray-400">
                  +{metrics.missingElements.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReportCompletionEstimator;
