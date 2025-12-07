// Follow-up Recommendation Engine
// Automatically suggests guideline-appropriate follow-up intervals based on findings

import { FOLLOW_UP_GUIDELINES, Guideline } from "../guidelines/followUpGuidelines";

export interface FollowUpRecommendation {
  finding: string;
  guideline: string;
  recommendation: string;
  urgency: "routine" | "short-term" | "urgent";
  timeframe?: string;
}

interface FindingPattern {
  pattern: RegExp;
  extractInfo: (match: RegExpMatchArray, fullText: string) => FollowUpRecommendation | null;
}

// Helper to extract size from text
function extractSize(text: string): number | null {
  const sizeMatch = text.match(/(\d+\.?\d*)\s*(mm|cm)/i);
  if (!sizeMatch) return null;
  
  const value = parseFloat(sizeMatch[1]);
  const unit = sizeMatch[2].toLowerCase();
  
  return unit === "cm" ? value * 10 : value; // Convert to mm
}

// Finding patterns and recommendation logic
const FINDING_PATTERNS: FindingPattern[] = [
  // Pulmonary nodules (Fleischer)
  {
    pattern: /\b(pulmonary|lung)\s+(nodule|opacity|lesion)/i,
    extractInfo: (match, fullText) => {
      const contextText = fullText.substring(Math.max(0, match.index! - 100), match.index! + 200);
      const size = extractSize(contextText);
      
      if (!size) {
        return {
          finding: "Pulmonary nodule (size not specified)",
          guideline: "Fleischer Society 2017",
          recommendation: "Specify nodule size for specific follow-up recommendations. Generally, nodules ≥6mm require follow-up.",
          urgency: "routine",
        };
      }
      
      if (size < 6) {
        return {
          finding: `Pulmonary nodule ${size}mm`,
          guideline: "Fleischer Society 2017",
          recommendation: "No routine follow-up for low-risk patients. Optional CT at 12 months for high-risk patients.",
          urgency: "routine",
          timeframe: "12 months (optional)",
        };
      } else if (size <= 8) {
        return {
          finding: `Pulmonary nodule ${size}mm`,
          guideline: "Fleischer Society 2017",
          recommendation: "Follow-up CT at 6-12 months, then consider CT at 18-24 months.",
          urgency: "short-term",
          timeframe: "6-12 months",
        };
      } else {
        return {
          finding: `Pulmonary nodule ${size}mm`,
          guideline: "Fleischer Society 2017",
          recommendation: "Consider CT at 3 months, PET/CT, or biopsy due to size >8mm.",
          urgency: "short-term",
          timeframe: "3 months",
        };
      }
    },
  },
  
  // Renal cysts (Bosniak)
  {
    pattern: /\b(renal|kidney)\s+(cyst|lesion)/i,
    extractInfo: (match, fullText) => {
      const contextText = fullText.substring(Math.max(0, match.index! - 100), match.index! + 200);
      
      // Check for Bosniak classification
      const bosniakRegex = /bosniak\s+(i{1,2}f|iii|iv|1|2|3|4)/i;
      if (bosniakRegex.test(contextText)) {
        const bosniakMatch = contextText.match(bosniakRegex);
        const classification = bosniakMatch![1].toUpperCase();
        
        if (classification.includes("I") && !classification.includes("F")) {
          return {
            finding: `Bosniak ${classification} renal cyst`,
            guideline: "Bosniak Classification v2019",
            recommendation: "No follow-up required for simple cyst.",
            urgency: "routine",
          };
        } else if (classification.includes("IIF") || classification === "2F") {
          return {
            finding: `Bosniak ${classification} renal cyst`,
            guideline: "Bosniak Classification v2019",
            recommendation: "Imaging follow-up at 6, 12, and 24 months.",
            urgency: "short-term",
            timeframe: "6 months",
          };
        } else if (classification.includes("III") || classification === "3") {
          return {
            finding: `Bosniak ${classification} renal cyst`,
            guideline: "Bosniak Classification v2019",
            recommendation: "Urologic consultation recommended for probable surgical intervention (50% malignancy risk).",
            urgency: "urgent",
            timeframe: "Urgent referral",
          };
        } else if (classification.includes("IV") || classification === "4") {
          return {
            finding: `Bosniak ${classification} renal cyst`,
            guideline: "Bosniak Classification v2019",
            recommendation: "Urologic consultation required for surgical excision (90% malignancy risk).",
            urgency: "urgent",
            timeframe: "Urgent referral",
          };
        }
      }
      
      return {
        finding: "Renal cyst (not classified)",
        guideline: "Bosniak Classification v2019",
        recommendation: "Consider Bosniak classification to determine appropriate follow-up.",
        urgency: "routine",
      };
    },
  },
  
  // Adrenal nodules
  {
    pattern: /\badrenal\s+(nodule|mass|adenoma|incidentaloma)/i,
    extractInfo: (match, fullText) => {
      const contextText = fullText.substring(Math.max(0, match.index! - 100), match.index! + 200);
      const size = extractSize(contextText);
      
      // Check for HU value
      const huMatch = contextText.match(/(-?\d+)\s*HU/i);
      const huValue = huMatch ? parseInt(huMatch[1]) : null;
      
      if (huValue !== null && huValue <= 10) {
        return {
          finding: `Adrenal nodule (${huValue} HU)`,
          guideline: "ACR Incidental Findings 2017",
          recommendation: "No follow-up required. Density ≤10 HU consistent with benign adenoma.",
          urgency: "routine",
        };
      }
      
      if (size) {
        if (size < 10) {
          return {
            finding: `Adrenal nodule ${size}mm`,
            guideline: "ACR Incidental Findings 2017",
            recommendation: "No follow-up required for nodule <1cm.",
            urgency: "routine",
          };
        } else if (size <= 40) {
          return {
            finding: `Adrenal nodule ${size}mm`,
            guideline: "ACR Incidental Findings 2017",
            recommendation: "Consider 12-month imaging follow-up if indeterminate features. Biochemical workup may be needed.",
            urgency: "short-term",
            timeframe: "12 months",
          };
        } else {
          return {
            finding: `Adrenal nodule ${size}mm`,
            guideline: "ACR Incidental Findings 2017",
            recommendation: "Surgical consultation recommended due to size >4cm (increased malignancy risk).",
            urgency: "urgent",
            timeframe: "Surgical consultation",
          };
        }
      }
      
      return {
        finding: "Adrenal nodule (size not specified)",
        guideline: "ACR Incidental Findings 2017",
        recommendation: "Measure nodule size and assess density for specific recommendations.",
        urgency: "routine",
      };
    },
  },
  
  // Thyroid nodules (ACR TI-RADS)
  {
    pattern: /\bthyroid\s+(nodule|mass|lesion)/i,
    extractInfo: (match, fullText) => {
      const contextText = fullText.substring(Math.max(0, match.index! - 100), match.index! + 200);
      const size = extractSize(contextText);
      
      if (size && size >= 10) {
        return {
          finding: `Thyroid nodule ${size}mm`,
          guideline: "ACR TI-RADS",
          recommendation: "Consider ultrasound evaluation for further characterization and potential FNA biopsy if ≥1cm.",
          urgency: "short-term",
          timeframe: "Ultrasound recommended",
        };
      }
      
      return {
        finding: "Thyroid nodule",
        guideline: "ACR TI-RADS",
        recommendation: "Consider ultrasound for further characterization.",
        urgency: "routine",
      };
    },
  },
];

export function generateFollowUpRecommendations(reportText: string): FollowUpRecommendation[] {
  const recommendations: FollowUpRecommendation[] = [];
  const seen = new Set<string>(); // Avoid duplicates
  
  for (const patternDef of FINDING_PATTERNS) {
    const matches = reportText.matchAll(new RegExp(patternDef.pattern, "gi"));
    
    for (const match of matches) {
      const recommendation = patternDef.extractInfo(match, reportText);
      if (recommendation) {
        const key = `${recommendation.finding}-${recommendation.recommendation}`;
        if (!seen.has(key)) {
          recommendations.push(recommendation);
          seen.add(key);
        }
      }
    }
  }
  
  return recommendations;
}

export function getRelevantGuidelines(reportText: string): Guideline[] {
  const relevant: Guideline[] = [];
  
  for (const guideline of FOLLOW_UP_GUIDELINES) {
    for (const keyword of guideline.keywords) {
      if (new RegExp(`\\b${keyword}\\b`, "i").test(reportText)) {
        relevant.push(guideline);
        break;
      }
    }
  }
  
  return relevant;
}
