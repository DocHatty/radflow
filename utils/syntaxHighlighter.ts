// utils/syntaxHighlighter.ts
// FIX: Implement and export the 'applySyntaxHighlighting' function to resolve the import error.
// This implementation safely highlights medical terms by traversing the DOM and replacing only text nodes,
// preserving the HTML structure.
import { medicalTerms } from '../lib/medicalTerms';

const termsRegex = new RegExp(`\\b(${Array.from(medicalTerms).join('|')})\\b`, 'gi');

/**
 * Applies syntax highlighting to an HTML string by wrapping medical terms in spans.
 * This function is designed to be robust and non-destructive. It processes only text nodes,
 * ensuring that existing HTML structure and attributes are preserved.
 * @param htmlString The HTML string to highlight.
 * @returns A new HTML string with medical terms wrapped in highlighting spans.
 */
export const applySyntaxHighlighting = (htmlString: string): string => {
    if (!htmlString || typeof document === 'undefined') {
        return htmlString;
    }

    // Create a temporary, disconnected DOM element to safely parse the HTML string.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Use a TreeWalker to efficiently visit every text node in the parsed HTML.
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode as Text);
    }

    textNodes.forEach(node => {
        // Don't highlight inside script/style tags or within already highlighted spans.
        if (
            node.parentElement?.tagName === 'SCRIPT' ||
            node.parentElement?.tagName === 'STYLE' ||
            node.parentElement?.classList.contains('highlight-term')
        ) {
            return;
        }
        
        const text = node.textContent;
        if (!text) return;
        
        // The regex with capturing groups in `split` includes the delimiters in the result array.
        // e.g., "word acute word".split(/(\bacute\b)/) -> ["word ", "acute", " word"]
        // Non-matches are at even indices, matches at odd indices.
        const parts = text.split(termsRegex);
        if (parts.length <= 1) return; // No matches found

        const fragment = document.createDocumentFragment();
        
        parts.forEach((part, i) => {
            if (i % 2 === 1) { // It's a medical term (delimiter)
                const span = document.createElement('span');
                span.className = 'highlight-term';
                span.textContent = part;
                fragment.appendChild(span);
            } else if (part) { // It's regular text
                fragment.appendChild(document.createTextNode(part));
            }
        });
        
        if (node.parentNode) {
            node.parentNode.replaceChild(fragment, node);
        }
    });

    return tempDiv.innerHTML;
};
