import { describe, it, expect } from 'vitest';
import {
  cleanText,
  removeControlCharacters,
  normalizeWhitespace,
  trimExtraLineBreaks,
} from '../textCleaner';

describe('removeControlCharacters', () => {
  it('returns empty string for empty input', () => {
    expect(removeControlCharacters('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(removeControlCharacters(undefined as unknown as string)).toBe('');
    expect(removeControlCharacters(null as unknown as string)).toBe('');
  });

  it('preserves normal text without control characters', () => {
    expect(removeControlCharacters('Hello, world!')).toBe('Hello, world!');
  });

  it('removes null bytes and other low control characters', () => {
    expect(removeControlCharacters('Hello\x00World')).toBe('HelloWorld');
    expect(removeControlCharacters('\x01\x02\x03text')).toBe('text');
    expect(removeControlCharacters('abc\x07def')).toBe('abcdef');
  });

  it('preserves tab characters (U+0009)', () => {
    expect(removeControlCharacters('Hello\tWorld')).toBe('Hello\tWorld');
  });

  it('preserves newline characters (U+000A)', () => {
    expect(removeControlCharacters('Hello\nWorld')).toBe('Hello\nWorld');
  });

  it('preserves carriage return characters (U+000D)', () => {
    expect(removeControlCharacters('Hello\rWorld')).toBe('Hello\rWorld');
  });

  it('removes vertical tab (U+000B) and form feed (U+000C)', () => {
    expect(removeControlCharacters('Hello\x0BWorld')).toBe('HelloWorld');
    expect(removeControlCharacters('Hello\x0CWorld')).toBe('HelloWorld');
  });

  it('removes high control characters (U+007F to U+009F)', () => {
    expect(removeControlCharacters('Hello\x7FWorld')).toBe('HelloWorld');
    expect(removeControlCharacters('Hello\x80World')).toBe('HelloWorld');
    expect(removeControlCharacters('Hello\x9FWorld')).toBe('HelloWorld');
  });

  it('removes multiple control characters in a single string', () => {
    expect(removeControlCharacters('\x00Hello\x01\x02World\x7F!')).toBe('HelloWorld!');
  });
});

describe('normalizeWhitespace', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeWhitespace('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(normalizeWhitespace(undefined as unknown as string)).toBe('');
  });

  it('collapses multiple spaces into a single space', () => {
    expect(normalizeWhitespace('Hello    World')).toBe('Hello World');
  });

  it('collapses multiple tabs into a single space', () => {
    expect(normalizeWhitespace('Hello\t\t\tWorld')).toBe('Hello World');
  });

  it('collapses mixed spaces and tabs into a single space', () => {
    expect(normalizeWhitespace('Hello \t \t World')).toBe('Hello World');
  });

  it('trims leading and trailing whitespace on each line', () => {
    expect(normalizeWhitespace('  Hello  ')).toBe('Hello');
    expect(normalizeWhitespace('  Hello  \n  World  ')).toBe('Hello\nWorld');
  });

  it('preserves newlines between lines', () => {
    expect(normalizeWhitespace('Line 1\nLine 2\nLine 3')).toBe('Line 1\nLine 2\nLine 3');
  });

  it('handles lines with only whitespace', () => {
    expect(normalizeWhitespace('Hello\n   \nWorld')).toBe('Hello\n\nWorld');
  });
});

describe('trimExtraLineBreaks', () => {
  it('returns empty string for empty input', () => {
    expect(trimExtraLineBreaks('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(trimExtraLineBreaks(undefined as unknown as string)).toBe('');
  });

  it('preserves single newlines', () => {
    expect(trimExtraLineBreaks('Hello\nWorld')).toBe('Hello\nWorld');
  });

  it('preserves double newlines (paragraph breaks)', () => {
    expect(trimExtraLineBreaks('Hello\n\nWorld')).toBe('Hello\n\nWorld');
  });

  it('collapses three or more newlines into two', () => {
    expect(trimExtraLineBreaks('Hello\n\n\nWorld')).toBe('Hello\n\nWorld');
    expect(trimExtraLineBreaks('Hello\n\n\n\n\nWorld')).toBe('Hello\n\nWorld');
  });

  it('normalizes \\r\\n line endings to \\n', () => {
    expect(trimExtraLineBreaks('Hello\r\nWorld')).toBe('Hello\nWorld');
  });

  it('normalizes standalone \\r to \\n', () => {
    expect(trimExtraLineBreaks('Hello\rWorld')).toBe('Hello\nWorld');
  });

  it('handles mixed line endings', () => {
    expect(trimExtraLineBreaks('Hello\r\n\r\n\r\nWorld')).toBe('Hello\n\nWorld');
  });

  it('collapses excessive newlines in multiple places', () => {
    const input = 'A\n\n\n\nB\n\n\n\nC';
    expect(trimExtraLineBreaks(input)).toBe('A\n\nB\n\nC');
  });
});

describe('cleanText', () => {
  it('returns empty string for empty input', () => {
    expect(cleanText('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(cleanText(undefined as unknown as string)).toBe('');
    expect(cleanText(null as unknown as string)).toBe('');
  });

  it('returns trimmed text for clean input', () => {
    expect(cleanText('Hello, world!')).toBe('Hello, world!');
  });

  it('removes soft hyphens (U+00AD)', () => {
    expect(cleanText('docu\u00ADment')).toBe('document');
  });

  it('removes zero-width spaces (U+200B)', () => {
    expect(cleanText('Hello\u200BWorld')).toBe('HelloWorld');
  });

  it('removes zero-width non-joiner (U+200C)', () => {
    expect(cleanText('Hello\u200CWorld')).toBe('HelloWorld');
  });

  it('removes zero-width joiner (U+200D)', () => {
    expect(cleanText('Hello\u200DWorld')).toBe('HelloWorld');
  });

  it('removes byte order mark (U+FEFF)', () => {
    expect(cleanText('\uFEFFHello World')).toBe('Hello World');
  });

  it('replaces non-breaking spaces (U+00A0) with regular spaces', () => {
    expect(cleanText('Hello\u00A0World')).toBe('Hello World');
  });

  it('converts form feed characters to newlines', () => {
    const result = cleanText('Page 1\fPage 2');
    expect(result).toBe('Page 1\nPage 2');
  });

  it('removes control characters while preserving content', () => {
    expect(cleanText('Hello\x00\x01\x02World')).toBe('HelloWorld');
  });

  it('normalizes multiple spaces into single space', () => {
    expect(cleanText('Hello     World')).toBe('Hello World');
  });

  it('trims leading and trailing whitespace', () => {
    expect(cleanText('   Hello World   ')).toBe('Hello World');
  });

  it('collapses excessive line breaks', () => {
    expect(cleanText('Hello\n\n\n\n\nWorld')).toBe('Hello\n\nWorld');
  });

  it('handles a combination of all cleaning operations', () => {
    const dirtyText = '  \uFEFF Hello\u00AD  \u200B  World \x00 \n\n\n\n  Foo\u00A0Bar  \n\n\n  ';
    const result = cleanText(dirtyText);
    expect(result).toBe('Hello World\n\nFoo Bar');
  });

  it('handles text with only whitespace', () => {
    expect(cleanText('   \n\n\n   ')).toBe('');
  });

  it('handles text with only control characters', () => {
    expect(cleanText('\x00\x01\x02\x03')).toBe('');
  });

  it('handles text with only formatting artifacts', () => {
    expect(cleanText('\u200B\u200C\u200D\uFEFF\u00AD')).toBe('');
  });

  it('preserves legitimate paragraph structure', () => {
    const input = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
    expect(cleanText(input)).toBe('Paragraph one.\n\nParagraph two.\n\nParagraph three.');
  });

  it('handles mixed line endings correctly', () => {
    const input = 'Line 1\r\nLine 2\rLine 3\nLine 4';
    const result = cleanText(input);
    expect(result).toBe('Line 1\nLine 2\nLine 3\nLine 4');
  });

  it('removes U+FFFE byte order mark variant', () => {
    expect(cleanText('Hello\uFFFEWorld')).toBe('HelloWorld');
  });

  it('handles very long text without issues', () => {
    const longText = 'word '.repeat(10000);
    const result = cleanText(longText);
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain('  ');
  });

  it('handles unicode content correctly', () => {
    expect(cleanText('日本語テスト')).toBe('日本語テスト');
    expect(cleanText('Ñoño café résumé')).toBe('Ñoño café résumé');
  });

  it('handles emoji content correctly', () => {
    expect(cleanText('Hello 👋 World 🌍')).toBe('Hello 👋 World 🌍');
  });
});