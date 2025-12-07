// Critical Findings Detection Utility
// Detects critical/urgent findings in dictation text

export interface CriticalFinding {
  type: string;
  severity: "critical" | "urgent";
  matched: string;
  position: number;
}

// Critical findings patterns
const CRITICAL_PATTERNS = [
  // Vascular emergencies
  { pattern: /\b(pulmonary\s+embol(ism|i|us)|PE\b)/i, type: "Pulmonary Embolism", severity: "critical" as const },
  { pattern: /\b(aortic\s+dissection)/i, type: "Aortic Dissection", severity: "critical" as const },
  { pattern: /\b(ruptured\s+aneurysm)/i, type: "Ruptured Aneurysm", severity: "critical" as const },
  { pattern: /\b(acute\s+aortic\s+syndrome)/i, type: "Acute Aortic Syndrome", severity: "critical" as const },
  
  // Neurological emergencies
  { pattern: /\b(acute\s+(stroke|infarct|ischemia))/i, type: "Acute Stroke", severity: "critical" as const },
  { pattern: /\b(intracranial\s+(hemorrhage|bleed))/i, type: "Intracranial Hemorrhage", severity: "critical" as const },
  { pattern: /\b(subarachnoid\s+hemorrhage)/i, type: "Subarachnoid Hemorrhage", severity: "critical" as const },
  { pattern: /\b(epidural\s+hematoma)/i, type: "Epidural Hematoma", severity: "critical" as const },
  { pattern: /\b(subdural\s+hematoma)/i, type: "Subdural Hematoma", severity: "critical" as const },
  { pattern: /\b(mass\s+effect|midline\s+shift)/i, type: "Mass Effect/Midline Shift", severity: "critical" as const },
  
  // Abdominal emergencies
  { pattern: /\b(free\s+air|pneumoperitoneum)/i, type: "Free Air/Pneumoperitoneum", severity: "critical" as const },
  { pattern: /\b(bowel\s+perforation)/i, type: "Bowel Perforation", severity: "critical" as const },
  { pattern: /\b(acute\s+mesenteric\s+ischemia)/i, type: "Mesenteric Ischemia", severity: "critical" as const },
  { pattern: /\b(ruptured\s+viscus)/i, type: "Ruptured Viscus", severity: "critical" as const },
  
  // Thoracic emergencies
  { pattern: /\b(tension\s+pneumothorax)/i, type: "Tension Pneumothorax", severity: "critical" as const },
  { pattern: /\b(large\s+pneumothorax)/i, type: "Large Pneumothorax", severity: "urgent" as const },
  { pattern: /\b(pericardial\s+tamponade)/i, type: "Pericardial Tamponade", severity: "critical" as const },
  
  // Malignancies
  { pattern: /\b(large\s+(mass|tumor|lesion))\s+(\d+\.?\d*\s*cm)/i, type: "Large Mass", severity: "urgent" as const },
  { pattern: /\b(metastatic\s+disease|metastases)/i, type: "Metastatic Disease", severity: "urgent" as const },
  
  // Spinal emergencies
  { pattern: /\b(spinal\s+cord\s+compression)/i, type: "Spinal Cord Compression", severity: "critical" as const },
  { pattern: /\b(cauda\s+equina\s+syndrome)/i, type: "Cauda Equina Syndrome", severity: "critical" as const },
];

export function detectCriticalFindings(text: string): CriticalFinding[] {
  const findings: CriticalFinding[] = [];
  
  for (const { pattern, type, severity } of CRITICAL_PATTERNS) {
    // Use matchAll to find all instances
    const matches = Array.from(text.matchAll(new RegExp(pattern, 'gi')));
    for (const match of matches) {
      findings.push({
        type,
        severity,
        matched: match[0],
        position: match.index || 0,
      });
    }
  }
  
  // Sort by position in text and remove duplicates
  const seen = new Set<string>();
  return findings
    .sort((a, b) => a.position - b.position)
    .filter(f => {
      const key = `${f.type}-${f.position}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function hasCriticalFindings(text: string): boolean {
  return CRITICAL_PATTERNS.some(({ pattern }) => pattern.test(text));
}

export function getCriticalFindingSummary(findings: CriticalFinding[]): string {
  if (findings.length === 0) return "";
  
  const critical = findings.filter(f => f.severity === "critical");
  const urgent = findings.filter(f => f.severity === "urgent");
  
  const parts: string[] = [];
  if (critical.length > 0) {
    parts.push(`${critical.length} CRITICAL finding${critical.length > 1 ? 's' : ''}`);
  }
  if (urgent.length > 0) {
    parts.push(`${urgent.length} urgent finding${urgent.length > 1 ? 's' : ''}`);
  }
  
  return parts.join(", ");
}
