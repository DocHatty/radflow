import { medicalTerms } from '../lib/medicalTerms';

/**
 * Parses a limited markdown-like syntax into an HTML string.
 * This utility is designed to be robust against minor formatting variations from the AI.
 * Supports:
 * - ### Headings
 * - **Bold text**
 * - * Unordered list items
 * @param content The string content to parse.
 * @returns An HTML string.
 */
export const parseMarkdownToHTML = (content: string): string => {
  if (!content) return '';

  let htmlContent = content;

  // 1. Handle @@buzzword@@ syntax for emphasis (High priority)
  htmlContent = htmlContent.replace(/@@(.*?)@@/g, '<span class="text-indigo-400 font-semibold tracking-wide">$1</span>');

  // 2. Handle "Section Name:" headers (e.g., "Top facts:")
  // We look for a line starting with text followed by a colon
  htmlContent = htmlContent.replace(/^([A-Za-z\s’'-]+):/gm, '<strong class="block text-slate-200 mt-4 mb-1 uppercase text-xs tracking-wider">$1:</strong>');

  // 3. Process block-level elements like headings and list items
  htmlContent = htmlContent
    .replace(/^\s*###\s*(.*$)/gim, '<h4 class="font-semibold text-[var(--color-primary)] text-sm mb-2 mt-3 first:mt-0">$1</h4>')
    .replace(/^\s*\*\s*(.*$)/gim, '<li class="relative before:content-[\'•\'] before:absolute before:left-[-1em] before:text-[var(--color-primary)]">$1</li>');

  // 4. Process inline elements like bold text
  htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text-bright)]">$1</strong>');

  // 5. Group consecutive list items into <ul> tags
  const groupedHtml = htmlContent.replace(/<\/li>\s*<li/g, '</li><li');
  const finalHtml = groupedHtml.replace(/(<li.*<\/li>)+/g, (match) => `<ul class="space-y-1.5 pl-4 my-2">${match}</ul>`);

  // 6. Convert remaining newlines to <br> to prevent "wall of text"
  // We do this LAST to avoid breaking the HTML structure we just built
  return finalHtml.replace(/\n/g, '<br />');
};


/**
 * Converts an HTML string from a contentEditable div into a clean plain text string,
 * correctly preserving line breaks. This is the core fix for the data corruption bug.
 * @param html The innerHTML string from the editor.
 * @returns A plain text string with newline characters.
 */
export function htmlToText(html: string): string {
  // Replace line-break tags with a newline character.
  // This handles <br>, <p>, and <div> which contentEditable uses for new lines.
  const withNewlines = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  // Create a temporary element to parse the HTML and strip all remaining tags.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = withNewlines;

  // Use textContent to get the raw text, which also decodes HTML entities (e.g., &amp; -> &)
  let text = tempDiv.textContent || '';

  // Trim leading/trailing whitespace that can result from block elements.
  return text.trim();
}

/**
 * Converts a plain text string into a safe HTML string, preserving line breaks.
 * This is the critical fix for the garbled text rendering bug, ensuring that
 * newlines from the AI are converted to <br> tags for correct display.
 * @param text The plain text to convert.
 * @returns An HTML string with newlines converted to <br> tags.
 */
export function textToHtml(text: string): string {
  if (typeof text !== 'string' || !text) return '';

  // Using a temporary div with `innerText` is a robust and safe way
  // to handle both newline conversion and HTML entity escaping.
  const tempDiv = document.createElement('div');
  tempDiv.innerText = text;
  return tempDiv.innerHTML;
}