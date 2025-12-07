// Report Completion Estimator
// Analyzes report content and estimates completeness based on expected sections

export interface CompletionMetrics {
  overallScore: number; // 0-100
  sections: {
    name: string;
    present: boolean;
    weight: number;
  }[];
  missingElements: string[];
}

// Expected report sections with weights
const EXPECTED_SECTIONS = [
  { name: "INDICATION", patterns: [/\bINDICATION\b/i, /\bCLINICAL HISTORY\b/i, /\bREASON FOR STUDY\b/i], weight: 10 },
  { name: "TECHNIQUE", patterns: [/\bTECHNIQUE\b/i, /\bMETHOD\b/i], weight: 8 },
  { name: "COMPARISON", patterns: [/\bCOMPARISON\b/i, /\bPRIOR\b/i, /\bCOMPARED TO\b/i], weight: 5 },
  { name: "FINDINGS", patterns: [/\bFINDINGS\b/i, /\bOBSERVATIONS\b/i], weight: 25 },
  { name: "IMPRESSION", patterns: [/\bIMPRESSION\b/i, /\bCONCLUSION\b/i, /\bSUMMARY\b/i], weight: 30 },
];

// Content quality indicators
const QUALITY_INDICATORS = [
  { name: "Specific measurements", pattern: /\d+\.?\d*\s*(mm|cm|x)/i, weight: 5 },
  { name: "Anatomical details", pattern: /\b(right|left|upper|lower|anterior|posterior|medial|lateral)\b/i, weight: 5 },
  { name: "Descriptive terms", pattern: /\b(normal|abnormal|mild|moderate|severe|stable|increased|decreased)\b/i, weight: 5 },
  { name: "Follow-up recommendation", pattern: /\b(follow.?up|recommend|suggest|correlate)/i, weight: 7 },
];

export function calculateCompletionMetrics(reportText: string): CompletionMetrics {
  const sections = EXPECTED_SECTIONS.map(section => ({
    name: section.name,
    present: section.patterns.some(pattern => pattern.test(reportText)),
    weight: section.weight,
  }));

  const qualityIndicators = QUALITY_INDICATORS.map(indicator => ({
    name: indicator.name,
    present: indicator.pattern.test(reportText),
    weight: indicator.weight,
  }));

  // Calculate score
  let earnedScore = 0;
  let totalWeight = 0;

  // Section scores
  sections.forEach(section => {
    totalWeight += section.weight;
    if (section.present) {
      earnedScore += section.weight;
    }
  });

  // Quality indicator scores
  qualityIndicators.forEach(indicator => {
    totalWeight += indicator.weight;
    if (indicator.present) {
      earnedScore += indicator.weight;
    }
  });

  // Calculate percentage
  const overallScore = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;

  // Identify missing elements
  const missingElements: string[] = [];
  sections.forEach(section => {
    if (!section.present) {
      missingElements.push(section.name);
    }
  });
  qualityIndicators.forEach(indicator => {
    if (!indicator.present) {
      missingElements.push(indicator.name);
    }
  });

  return {
    overallScore,
    sections,
    missingElements,
  };
}

export function getCompletionLevel(score: number): {
  level: "minimal" | "basic" | "good" | "excellent";
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      level: "excellent",
      color: "emerald",
      message: "Report is comprehensive and complete",
    };
  } else if (score >= 70) {
    return {
      level: "good",
      color: "blue",
      message: "Report contains essential elements",
    };
  } else if (score >= 50) {
    return {
      level: "basic",
      color: "yellow",
      message: "Report has basic structure but missing key elements",
    };
  } else {
    return {
      level: "minimal",
      color: "red",
      message: "Report needs significant additions",
    };
  }
}
