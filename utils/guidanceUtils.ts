/**
 * A robust parser that scans the entire content string to find an appropriateness tag.
 * This makes the UI resilient to AI formatting errors, like adding a preamble.
 * @param content The full string output from the AI.
 * @returns An object with the parsed status, reason, and the remaining content.
 */
export const parseGuidance = (content: string) => {
  let status: "consistent" | "inconsistent" | "indeterminate" | null = null;
  let reason: string | null = null;
  let contentToRender = content;

  const patterns = {
    consistentWithReason: /\[CONSISTENT:\s*(.*?)\]/im,
    inconsistentWithReason: /\[INCONSISTENT:\s*(.*?)\]/im,
    indeterminate: /\[INDETERMINATE\]/im,
    consistentSimple: /\[CONSISTENT\]/im,
    inconsistentSimple: /\[INCONSISTENT\]/im,
  };

  const consistentMatch = content.match(patterns.consistentWithReason);
  const inconsistentMatch = content.match(patterns.inconsistentWithReason);

  if (consistentMatch) {
    status = "consistent";
    reason = consistentMatch[1].trim();
    contentToRender = content.replace(consistentMatch[0], "").trim();
  } else if (inconsistentMatch) {
    status = "inconsistent";
    reason = inconsistentMatch[1].trim();
    contentToRender = content.replace(inconsistentMatch[0], "").trim();
  } else if (patterns.indeterminate.test(content)) {
    status = "indeterminate";
    contentToRender = content.replace(patterns.indeterminate, "").trim();
  } else if (patterns.consistentSimple.test(content)) {
    status = "consistent";
    contentToRender = content.replace(patterns.consistentSimple, "").trim();
  } else if (patterns.inconsistentSimple.test(content)) {
    status = "inconsistent";
    contentToRender = content.replace(patterns.inconsistentSimple, "").trim();
  }

  return { status, reason, contentToRender };
};
