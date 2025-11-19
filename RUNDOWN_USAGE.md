# Real-World Rundown - Parallel API Implementation

## Overview

The Real-World Rundown feature generates clinical guidance broken into 7 sections, with each section making its own API call **simultaneously in parallel**. This significantly reduces total generation time compared to sequential processing.

## Architecture

### Sections Generated (All in Parallel)

1. **Top Facts** - Critical clinical facts about the finding (3-4 bullets)
2. **What We're Really Looking For** - Specific imaging features for assessment (4-5 bullets)
3. **Common Pitfalls/Mimics** - Differential diagnoses and distinguishing features (3-5 items)
4. **High-Yield Search Pattern** - Systematic interpretation checklist (5-7 steps)
5. **Pertinent Negatives That Matter** - Important negative findings (4-6 items)
6. **Classic Signs** - Classic imaging signs with explanations (2-4 signs)
7. **One-Sentence Bottom Line** - Clinical management summary (max 25 words)

### How It Works

```typescript
// 1. All sections are initialized
const rundownData = initializeRundownData();

// 2. All 7 API calls are launched simultaneously
await generateRundownParallel(clinicalContext, (key, content) => {
  // 3. Each section updates independently as it completes
  updateRundownSection(key, content);
});
```

## Files Modified/Created

### New Files
- `services/rundownService.ts` - Parallel API orchestration
- `components/RealWorldRundown.tsx` - UI component for display
- `RUNDOWN_USAGE.md` - This documentation

### Modified Files
- `types.ts` - Added 7 new AiTaskType entries and 7 PromptKey entries
- `settings/PROMPTS.md` - Added 7 concise system instructions
- `services/aiOrchestrator.ts` - Added 7 task configurations
- `store/createWorkflowSlice.ts` - Added rundown state and actions
- `settings/defaults.ts` - Added model assignments for rundown tasks

## Usage in Components

```typescript
import { useWorkflowStore } from "../App";
import RealWorldRundown from "./RealWorldRundown";

const MyComponent = () => {
  const { rundownData, isGeneratingRundown, generateRundown } = useWorkflowStore();

  return (
    <div>
      <button onClick={generateRundown}>Generate Rundown</button>
      <RealWorldRundown 
        data={rundownData} 
        isGenerating={isGeneratingRundown} 
      />
    </div>
  );
};
```

## Prompt Design

Each section's prompt is designed to be:
- **Concise** - Maximum 2 sentences per bullet for most sections
- **Specific** - Enforces plain text output (no markdown)
- **Brief** - Instructions are ~20-30 words each
- **Parallel-safe** - No dependencies between sections

Example prompt instruction:
```
Generate 3-4 concise bullet points covering the most critical clinical facts 
about this imaging finding. Focus on: typical imaging appearance, WHO grading 
criteria, key prognostic factors, and associated syndromes. Maximum 2 sentences 
per bullet. Output plain text only, no markdown.
```

## Performance

### Sequential (Old Approach)
7 sections × ~3 seconds each = **~21 seconds total**

### Parallel (New Approach)
Max(section completion times) = **~3-5 seconds total**

**Speed improvement: 4-7x faster**

## State Management

The workflow store manages:
- `rundownData: RundownData | null` - All section content and loading states
- `isGeneratingRundown: boolean` - Global generation flag
- `generateRundown()` - Initiates parallel generation
- `updateRundownSection()` - Updates individual sections

Each section tracks:
```typescript
interface RundownSection {
  title: string;
  content: string;
  isLoading: boolean;
  error?: string;
}
```

## Model Configuration

All rundown tasks use `gemini-2.5-flash` by default for speed. Can be changed in:
- Settings Panel UI
- `settings/defaults.ts` file

## Integration Points

To add the rundown to your UI:

1. Import the component:
```typescript
import RealWorldRundown from "./components/RealWorldRundown";
```

2. Add to your layout (e.g., in CopilotPanel):
```typescript
<RealWorldRundown 
  data={rundownData} 
  isGenerating={isGeneratingRundown} 
/>
```

3. Trigger generation:
```typescript
// Usually after the study is submitted
await generateRundown();
```

## Error Handling

- Individual section failures don't block other sections
- Errors are displayed inline within each section card
- `Promise.allSettled()` ensures all sections complete even if some fail
- Global error state is set if the entire process fails

## Styling

The component uses existing design tokens:
- `--color-panel-bg` - Section card backgrounds
- `--color-primary` - Section titles
- `--color-border` - Card borders
- `copilot-loading-glow` - Loading animation class

## Future Enhancements

Potential improvements:
1. Cache results per study type
2. Allow custom section ordering
3. Add section-specific grounding/search
4. Support streaming for longer sections
5. Add section collapse/expand functionality
