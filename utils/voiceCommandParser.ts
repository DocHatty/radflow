// Voice Command Parser
// Parses voice input for special commands and triggers appropriate actions

export type VoiceCommandType =
  | "insert_template"
  | "compare_prior"
  | "flag_critical"
  | "clear_text"
  | "undo"
  | "new_paragraph"
  | "normal_exam"
  | "unknown";

export interface VoiceCommand {
  type: VoiceCommandType;
  originalText: string;
  parameter?: string;
}

// Command patterns
const COMMAND_PATTERNS = [
  // Template insertion
  {
    pattern: /\b(insert|add|use)\s+(normal|template|standard)\s+(chest|abdomen|head|brain|ct|mri|x-ray|pelvis|spine)\b/i,
    type: "insert_template" as const,
    extractParameter: (match: RegExpMatchArray) => match[3],
  },
  {
    pattern: /\b(normal|unremarkable)\s+(chest|abdomen|head|brain|ct|x-ray|pelvis|spine|exam|study)\b/i,
    type: "normal_exam" as const,
    extractParameter: (match: RegExpMatchArray) => match[2],
  },
  
  // Prior comparison
  {
    pattern: /\b(compare\s+to|compared\s+to|comparison\s+to)\s+prior/i,
    type: "compare_prior" as const,
  },
  
  // Critical flagging
  {
    pattern: /\b(flag\s+as|mark\s+as)\s+critical/i,
    type: "flag_critical" as const,
  },
  
  // Text manipulation
  {
    pattern: /\b(clear|delete|remove)\s+(all|everything|text)/i,
    type: "clear_text" as const,
  },
  {
    pattern: /\b(undo|go\s+back)\b/i,
    type: "undo" as const,
  },
  {
    pattern: /\b(new\s+paragraph|next\s+paragraph|break|new\s+line)\b/i,
    type: "new_paragraph" as const,
  },
];

export function parseVoiceCommand(text: string): VoiceCommand | null {
  const trimmedText = text.trim().toLowerCase();
  
  for (const commandPattern of COMMAND_PATTERNS) {
    const match = trimmedText.match(commandPattern.pattern);
    if (match) {
      return {
        type: commandPattern.type,
        originalText: text,
        parameter: commandPattern.extractParameter?.(match),
      };
    }
  }
  
  return null;
}

export function isVoiceCommand(text: string): boolean {
  return parseVoiceCommand(text) !== null;
}

// Template content for normal exams
export const NORMAL_EXAM_TEMPLATES: Record<string, string> = {
  chest: `CHEST CT:

TECHNIQUE: Axial CT images of the chest were obtained without intravenous contrast.

FINDINGS:
- Lungs: Clear. No focal consolidation, mass, or pleural effusion.
- Mediastinum: Normal caliber of the great vessels. No lymphadenopathy.
- Heart: Normal size.
- Bones: No acute fracture or destructive osseous lesion.

IMPRESSION:
1. Normal unenhanced CT of the chest.`,

  abdomen: `ABDOMEN CT:

TECHNIQUE: Axial CT images of the abdomen and pelvis were obtained.

FINDINGS:
- Liver: Normal size and attenuation. No focal lesion.
- Gallbladder: Normal.
- Pancreas: Unremarkable.
- Spleen: Normal size.
- Kidneys: Bilateral kidneys are normal in size and enhancement. No hydronephrosis or calculus.
- Bowel: No evidence of obstruction or free air.
- No free fluid or lymphadenopathy.

IMPRESSION:
1. Normal CT abdomen and pelvis.`,

  head: `HEAD CT:

TECHNIQUE: Axial CT images of the head were obtained without intravenous contrast.

FINDINGS:
- No acute intracranial hemorrhage, mass effect, or midline shift.
- Ventricles and sulci are normal in size and configuration.
- No extra-axial fluid collection.
- Visualized paranasal sinuses and mastoid air cells are clear.

IMPRESSION:
1. Normal unenhanced CT of the head.`,

  brain: `BRAIN MRI:

TECHNIQUE: Multiplanar multisequence MR imaging of the brain was performed.

FINDINGS:
- No acute infarct or intracranial hemorrhage.
- No abnormal parenchymal signal or mass lesion.
- Normal gray-white differentiation.
- Ventricles and extra-axial CSF spaces are normal in size.
- No abnormal enhancement.

IMPRESSION:
1. Normal brain MRI.`,

  spine: `SPINE MRI:

TECHNIQUE: Multiplanar multisequence MR imaging of the spine was performed.

FINDINGS:
- Vertebral body heights and alignment are maintained.
- No concerning marrow signal abnormality.
- Intervertebral disc spaces are preserved.
- No significant spinal canal or neural foraminal stenosis.
- Spinal cord demonstrates normal signal and caliber.

IMPRESSION:
1. Normal spine MRI.`,
};

export function getTemplateForStudyType(studyType: string): string {
  const normalizedType = studyType.toLowerCase();
  
  // Check for exact matches first
  if (NORMAL_EXAM_TEMPLATES[normalizedType]) {
    return NORMAL_EXAM_TEMPLATES[normalizedType];
  }
  
  // Check for word boundary matches to avoid partial word matches
  for (const [key, template] of Object.entries(NORMAL_EXAM_TEMPLATES)) {
    const keyRegex = new RegExp(`\\b${key}\\b`, 'i');
    if (keyRegex.test(normalizedType)) {
      return template;
    }
  }
  
  // Generic template as fallback
  return `FINDINGS:
Normal examination.

IMPRESSION:
1. No acute abnormality.`;
}
