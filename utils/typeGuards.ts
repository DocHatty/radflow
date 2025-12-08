import { LabResult, Prior, RejectableItem } from "../types";

export function isLabResult(obj: unknown): obj is LabResult {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "name" in obj &&
    typeof (obj as LabResult).name === "string" &&
    "value" in obj &&
    typeof (obj as LabResult).value === "string"
  );
}

export function isPrior(obj: unknown): obj is Prior {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "content" in obj &&
    typeof (obj as Prior).content === "string"
  );
}

export function isRejectableItem(obj: unknown): obj is RejectableItem {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "value" in obj &&
    typeof (obj as RejectableItem).value === "string"
  );
}
