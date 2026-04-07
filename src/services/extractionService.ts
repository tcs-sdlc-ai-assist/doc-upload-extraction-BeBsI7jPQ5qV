import { ExtractionResult, SupportedFileType } from '../types';
import { SUPPORTED_MIME_TYPES, MAX_RETRY_ATTEMPTS } from '../constants';
import { extractPdfText } from './pdfExtractor';
import { extractDocxText } from './docxExtractor';
import { extractTxtText } from './txtExtractor';
import { cleanText } from '../utils/textCleaner';

function getExtractor(
  fileType: string
): ((file: File) => Promise<ExtractionResult>) | null {
  const extractors: Record<
    SupportedFileType,
    (file: File) => Promise<ExtractionResult>
  > = {
    'application/pdf': extractPdfText,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      extractDocxText,
    'text/plain': extractTxtText,
  };

  return extractors[fileType as SupportedFileType] ?? null;
}

export async function extractText(file: File): Promise<ExtractionResult> {
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      text: '',
      error: `Unsupported file type: "${file.type}". Supported types are PDF, DOCX, and TXT.`,
    };
  }

  const extractor = getExtractor(file.type);

  if (!extractor) {
    return {
      success: false,
      text: '',
      error: `No extractor available for file type: "${file.type}".`,
    };
  }

  try {
    const result = await extractor(file);

    if (!result.success) {
      return result;
    }

    const cleanedText = cleanText(result.text);

    return {
      success: true,
      text: cleanedText,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown extraction error';
    return {
      success: false,
      text: '',
      error: `Text extraction failed for "${file.name}": ${errorMessage}`,
    };
  }
}

export async function extractWithRetry(
  file: File,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<ExtractionResult> {
  let lastResult: ExtractionResult = {
    success: false,
    text: '',
    error: 'Extraction not attempted.',
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      lastResult = await extractText(file);

      if (lastResult.success) {
        return lastResult;
      }

      if (attempt < maxRetries) {
        await delay(getBackoffDelay(attempt));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      lastResult = {
        success: false,
        text: '',
        error: `Extraction attempt ${attempt}/${maxRetries} failed for "${file.name}": ${errorMessage}`,
      };

      if (attempt < maxRetries) {
        await delay(getBackoffDelay(attempt));
      }
    }
  }

  return {
    success: false,
    text: '',
    error: `Text extraction failed after ${maxRetries} attempts for "${file.name}". Last error: ${lastResult.error ?? 'Unknown error'}`,
  };
}

function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 5000);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}