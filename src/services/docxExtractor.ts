import mammoth from 'mammoth';
import type { ExtractionResult } from '../types';

export async function extractDocxText(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    const text = result.value || '';

    if (!text.trim()) {
      return {
        success: true,
        text: '',
        error: 'The DOCX file appears to be empty or contains no extractable text.',
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred during DOCX extraction';

    return {
      success: false,
      text: '',
      error: `DOCX extraction failed: ${errorMessage}`,
    };
  }
}