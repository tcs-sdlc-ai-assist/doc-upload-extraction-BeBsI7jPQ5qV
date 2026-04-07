import { ExtractionResult } from '../types';

export async function extractTxtText(file: File): Promise<ExtractionResult> {
  try {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return a string result.'));
        }
      };

      reader.onerror = () => {
        reject(new Error(`FileReader error: ${reader.error?.message ?? 'Unknown error reading file.'}`));
      };

      reader.onabort = () => {
        reject(new Error('File reading was aborted.'));
      };

      reader.readAsText(file, 'UTF-8');
    });

    if (!text || text.trim().length === 0) {
      return {
        success: true,
        text: '',
        error: 'The text file appears to be empty.',
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during text extraction.';
    return {
      success: false,
      text: '',
      error: `TXT extraction failed: ${errorMessage}`,
    };
  }
}