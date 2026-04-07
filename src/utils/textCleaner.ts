/**
 * Text cleaning utility to remove formatting artifacts, extra whitespace,
 * control characters, and normalize extracted text for clean display.
 */

/**
 * Removes control characters from text, preserving common whitespace characters
 * (newline, carriage return, tab).
 * @param text - Raw text that may contain control characters
 * @returns Text with control characters removed
 */
export function removeControlCharacters(text: string): string {
  if (!text) return '';
  // Remove control characters (U+0000 to U+001F and U+007F to U+009F)
  // but preserve tab (U+0009), newline (U+000A), and carriage return (U+000D)
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

/**
 * Normalizes whitespace by collapsing multiple spaces/tabs into single spaces
 * and trimming leading/trailing whitespace on each line.
 * @param text - Text with potentially irregular whitespace
 * @returns Text with normalized whitespace
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n');
}

/**
 * Trims excessive consecutive line breaks down to a maximum of two
 * (one blank line between paragraphs).
 * @param text - Text with potentially excessive line breaks
 * @returns Text with trimmed line breaks
 */
export function trimExtraLineBreaks(text: string): string {
  if (!text) return '';
  // Normalize different line ending styles to \n
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Collapse 3+ consecutive newlines into 2 (preserving paragraph breaks)
  return normalized.replace(/\n{3,}/g, '\n\n');
}

/**
 * Comprehensive text cleaning pipeline that removes formatting artifacts,
 * control characters, extra whitespace, and normalizes the extracted text.
 * @param rawText - Raw extracted text from a document
 * @returns Cleaned and normalized text ready for display
 */
export function cleanText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Step 1: Remove control characters
  text = removeControlCharacters(text);

  // Step 2: Remove common PDF/DOCX formatting artifacts
  // Remove soft hyphens
  text = text.replace(/\u00AD/g, '');
  // Remove zero-width spaces and joiners
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // Remove non-breaking spaces, replace with regular spaces
  text = text.replace(/\u00A0/g, ' ');
  // Remove form feed characters
  text = text.replace(/\f/g, '\n');
  // Remove byte order marks
  text = text.replace(/\uFFFE/g, '');

  // Step 3: Normalize whitespace within lines
  text = normalizeWhitespace(text);

  // Step 4: Trim excessive line breaks
  text = trimExtraLineBreaks(text);

  // Step 5: Final trim of leading/trailing whitespace
  text = text.trim();

  return text;
}