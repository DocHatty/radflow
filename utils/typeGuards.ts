import { LabResult, Prior, RejectableItem } from "../types";

export function isLabResult(obj: any): obj is LabResult {
  return obj && typeof obj.name === "string" && typeof obj.value === "string";
}

export function isPrior(obj: any): obj is Prior {
  return obj && typeof obj.content === "string";
}

export function isRejectableItem(obj: any): obj is RejectableItem {
  return obj && typeof obj.value === "string";
}
