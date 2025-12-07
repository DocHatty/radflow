import { describe, it, expect } from 'vitest';
import { parseMarkdownToHTML } from '../utils/textUtils';

describe('parseMarkdownToHTML', () => {
  it('should return empty string for empty input', () => {
    expect(parseMarkdownToHTML('')).toBe('');
  });

  it('should handle buzzword syntax with @@', () => {
    const input = 'This is a @@buzzword@@ example';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('class="text-indigo-400 font-semibold tracking-wide"');
    expect(output).toContain('buzzword');
  });

  it('should convert section headers', () => {
    const input = 'Top facts:\nContent here';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<strong class="block text-slate-200');
    expect(output).toContain('Top facts:');
  });

  it('should convert markdown headings to HTML', () => {
    const input = '### Important Section';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<h4');
    expect(output).toContain('Important Section');
  });

  it('should convert markdown lists to HTML', () => {
    const input = '* First item\n* Second item';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<ul');
    expect(output).toContain('<li');
    expect(output).toContain('First item');
    expect(output).toContain('Second item');
  });

  it('should convert bold text', () => {
    const input = 'This is **bold** text';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<strong');
    expect(output).toContain('bold');
  });

  it('should convert newlines to <br> tags', () => {
    const input = 'Line 1\nLine 2';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<br />');
  });

  it('should handle complex markdown with multiple features', () => {
    const input = '### Heading\n\nTop facts:\n* Item 1\n* Item 2\n\n**Bold** and @@buzzword@@';
    const output = parseMarkdownToHTML(input);
    expect(output).toContain('<h4');
    expect(output).toContain('<ul');
    expect(output).toContain('<strong');
    expect(output).toContain('buzzword');
  });
});
