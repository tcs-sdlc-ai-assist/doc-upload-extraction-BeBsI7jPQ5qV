import type { ExtractionResult } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export async function extractPdfText(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .filter((item): item is { str: string; hasEOL: boolean; transform: number[]; width: number; height: number; dir: string; fontName: string } => 'str' in item)
        .map((item) => {
          if (item.hasEOL) {
            return item.str + '\n';
          }
          return item.str;
        })
        .join(' ');

      if (pageText.trim().length > 0) {
        textParts.push(pageText);
      }
    }

    const extractedText = textParts.join('\n\n');

    if (extractedText.trim().length === 0) {
      return {
        success: false,
        text: '',
        error: 'No text content could be extracted from the PDF. The file may contain only images or scanned content.',
      };
    }

    return {
      success: true,
      text: extractedText,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      text: '',
      error: `PDF extraction failed: ${errorMessage}`,
    };
  }
}