// services/rundownService.ts
import { runAiTask } from "./aiOrchestrator";
import { AiTaskType } from "../types";

export interface RundownSection {
  title: string;
  content: string;
  isLoading: boolean;
  error?: string;
}

export interface RundownData {
  appropriateness: RundownSection;
  topFacts: RundownSection;
  whatToLookFor: RundownSection;
  pitfalls: RundownSection;
  searchPattern: RundownSection;
  pertinentNegatives: RundownSection;
  classicSigns: RundownSection;
  bottomLine: RundownSection;
}

// Note: Appropriateness is fetched separately via getAppropriateness task (with grounding support)
// These are the parallel rundown sections only
const SECTION_CONFIG: Array<{
  key: keyof RundownData;
  title: string;
  task: AiTaskType;
}> = [
  { key: "topFacts", title: "Top Facts", task: "rundownTopFacts" },
  {
    key: "whatToLookFor",
    title: "What to Look For",
    task: "rundownWhatToLookFor",
  },
  {
    key: "pitfalls",
    title: "Pitfalls & Mimics",
    task: "rundownPitfalls",
  },
  {
    key: "searchPattern",
    title: "Search Pattern",
    task: "rundownSearchPattern",
  },
  {
    key: "pertinentNegatives",
    title: "Pertinent Negatives",
    task: "rundownPertinentNegatives",
  },
  {
    key: "classicSigns",
    title: "Classic Signs",
    task: "rundownClassicSigns",
  },
  {
    key: "bottomLine",
    title: "Bottom Line",
    task: "rundownBottomLine",
  },
];

export const initializeRundownData = (): RundownData => {
  const data: any = {};
  SECTION_CONFIG.forEach((section) => {
    data[section.key] = {
      title: section.title,
      content: "",
      isLoading: false,
    };
  });
  return data as RundownData;
};

/**
 * Generate all rundown sections in parallel
 * @param clinicalContext The clinical brief or study information
 * @param onSectionUpdate Callback when a section completes
 * @returns Promise that resolves when all sections are complete
 */
export const generateRundownParallel = async (
  clinicalContext: string,
  onSectionUpdate: (key: keyof RundownData, content: string) => void,
): Promise<void> => {
  // Create all API calls simultaneously
  const promises = SECTION_CONFIG.map(async (section) => {
    try {
      const result = await runAiTask<string>(section.task, {
        prompt: clinicalContext,
      });
      onSectionUpdate(section.key, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      onSectionUpdate(section.key, `Error: ${errorMessage}`);
      throw error;
    }
  });

  // Wait for all sections to complete
  await Promise.allSettled(promises);
};

export { SECTION_CONFIG };
