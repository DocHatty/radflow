// utils/caretUtils.ts

/**
 * Saves the current caret position within a contentEditable element.
 * @param element The contentEditable element.
 * @returns The character offset of the caret from the start of the element.
 */
export function saveCaretPosition(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return 0;
  }

  const range = selection.getRangeAt(0);
  // Create a temporary range from the start of the element to the start of the selection
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // The length of the text in this temporary range is the caret's character offset
  return preCaretRange.toString().length;
}

/**
 * Restores the caret position within a contentEditable element.
 * @param element The contentEditable element.
 * @param position The character offset to restore the caret to.
 */
export function restoreCaretPosition(element: HTMLElement, position: number): void {
  if (position === null) return;

  const selection = window.getSelection();
  const range = document.createRange();
  let charCount = 0;
  let found = false;

  // Use a TreeWalker to iterate through only the text nodes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let node;

  while ((node = walker.nextNode()) && !found) {
    const textNode = node as Text;
    const nextCharCount = charCount + textNode.length;
    if (position <= nextCharCount) {
      range.setStart(textNode, position - charCount);
      range.collapse(true); // Collapse the range to a single point (the caret)
      found = true;
    } else {
      charCount = nextCharCount;
    }
  }

  // If the position is beyond the last text node, place it at the end
  if (!found) {
    range.selectNodeContents(element);
    range.collapse(false);
  }

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
