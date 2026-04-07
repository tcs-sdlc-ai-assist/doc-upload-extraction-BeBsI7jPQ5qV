import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractText, extractWithRetry } from '../extractionService';
import * as pdfExtractor from '../pdfExtractor';
import * as docxExtractor from '../docxExtractor';
import * as txtExtractor from '../txtExtractor';
import type { ExtractionResult } from '../../types';

vi.mock('../pdfExtractor', () => ({
  extractPdfText: vi.fn(),
}));

vi.mock('../docxExtractor', () => ({
  extractDocxText: vi.fn(),
}));

vi.mock('../txtExtractor', () => ({
  extractTxtText: vi.fn(),
}));

function createMockFile(name: string, type: string, content: string = 'test content'): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('extractionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractText', () => {
    it('routes PDF files to the PDF extractor', async () => {
      const mockResult: ExtractionResult = {
        success: true,
        text: 'Extracted PDF text content',
      };
      vi.mocked(pdfExtractor.extractPdfText).mockResolvedValue(mockResult);

      const file = createMockFile('document.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(pdfExtractor.extractPdfText).toHaveBeenCalledWith(file);
      expect(result.success).toBe(true);
      expect(result.text).toBe('Extracted PDF text content');
    });

    it('routes DOCX files to the DOCX extractor', async () => {
      const mockResult: ExtractionResult = {
        success: true,
        text: 'Extracted DOCX text content',
      };
      vi.mocked(docxExtractor.extractDocxText).mockResolvedValue(mockResult);

      const file = createMockFile(
        'document.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      const result = await extractText(file);

      expect(docxExtractor.extractDocxText).toHaveBeenCalledWith(file);
      expect(result.success).toBe(true);
      expect(result.text).toBe('Extracted DOCX text content');
    });

    it('routes TXT files to the TXT extractor', async () => {
      const mockResult: ExtractionResult = {
        success: true,
        text: 'Extracted TXT text content',
      };
      vi.mocked(txtExtractor.extractTxtText).mockResolvedValue(mockResult);

      const file = createMockFile('document.txt', 'text/plain');
      const result = await extractText(file);

      expect(txtExtractor.extractTxtText).toHaveBeenCalledWith(file);
      expect(result.success).toBe(true);
      expect(result.text).toBe('Extracted TXT text content');
    });

    it('rejects unsupported file types', async () => {
      const file = createMockFile('image.png', 'image/png');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toContain('Unsupported file type');
      expect(pdfExtractor.extractPdfText).not.toHaveBeenCalled();
      expect(docxExtractor.extractDocxText).not.toHaveBeenCalled();
      expect(txtExtractor.extractTxtText).not.toHaveBeenCalled();
    });

    it('returns failure when extractor returns failure', async () => {
      const mockResult: ExtractionResult = {
        success: false,
        text: '',
        error: 'PDF parsing error: corrupted file',
      };
      vi.mocked(pdfExtractor.extractPdfText).mockResolvedValue(mockResult);

      const file = createMockFile('broken.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBe('PDF parsing error: corrupted file');
    });

    it('handles extractor throwing an exception', async () => {
      vi.mocked(pdfExtractor.extractPdfText).mockRejectedValue(
        new Error('Unexpected PDF library crash')
      );

      const file = createMockFile('crash.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toContain('Unexpected PDF library crash');
    });

    it('cleans extracted text on success', async () => {
      const mockResult: ExtractionResult = {
        success: true,
        text: '  Hello   World  \n\n\n\n  Extra   spaces  ',
      };
      vi.mocked(txtExtractor.extractTxtText).mockResolvedValue(mockResult);

      const file = createMockFile('messy.txt', 'text/plain');
      const result = await extractText(file);

      expect(result.success).toBe(true);
      // Text should be cleaned: normalized whitespace and trimmed line breaks
      expect(result.text).not.toContain('   ');
      expect(result.text).toContain('Hello');
      expect(result.text).toContain('World');
    });

    it('rejects file with empty string MIME type', async () => {
      const blob = new Blob(['content'], { type: '' });
      const file = new File([blob], 'unknown', { type: '' });
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });
  });

  describe('extractWithRetry', () => {
    it('returns immediately on first successful extraction', async () => {
      const mockResult: ExtractionResult = {
        success: true,
        text: 'Success on first try',
      };
      vi.mocked(txtExtractor.extractTxtText).mockResolvedValue(mockResult);

      const file = createMockFile('good.txt', 'text/plain');
      const result = await extractWithRetry(file, 3);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Success on first try');
      expect(txtExtractor.extractTxtText).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds on subsequent attempt', async () => {
      const failResult: ExtractionResult = {
        success: false,
        text: '',
        error: 'Temporary failure',
      };
      const successResult: ExtractionResult = {
        success: true,
        text: 'Success after retry',
      };

      vi.mocked(pdfExtractor.extractPdfText)
        .mockResolvedValueOnce(failResult)
        .mockResolvedValueOnce(successResult);

      const file = createMockFile('retry.pdf', 'application/pdf');
      const result = await extractWithRetry(file, 3);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Success after retry');
      expect(pdfExtractor.extractPdfText).toHaveBeenCalledTimes(2);
    });

    it('returns failure after exhausting all retry attempts', async () => {
      const failResult: ExtractionResult = {
        success: false,
        text: '',
        error: 'Persistent failure',
      };

      vi.mocked(pdfExtractor.extractPdfText).mockResolvedValue(failResult);

      const file = createMockFile('always-fails.pdf', 'application/pdf');
      const result = await extractWithRetry(file, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('failed after 2 attempts');
      expect(pdfExtractor.extractPdfText).toHaveBeenCalledTimes(2);
    });

    it('handles exceptions during retry and continues retrying', async () => {
      vi.mocked(docxExtractor.extractDocxText)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          text: 'Recovered after exception',
        });

      const file = createMockFile(
        'recover.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      const result = await extractWithRetry(file, 3);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Recovered after exception');
      expect(docxExtractor.extractDocxText).toHaveBeenCalledTimes(2);
    });

    it('returns failure with last error after all retries throw exceptions', async () => {
      vi.mocked(pdfExtractor.extractPdfText)
        .mockRejectedValueOnce(new Error('Error attempt 1'))
        .mockRejectedValueOnce(new Error('Error attempt 2'))
        .mockRejectedValueOnce(new Error('Error attempt 3'));

      const file = createMockFile('crash-all.pdf', 'application/pdf');
      const result = await extractWithRetry(file, 3);

      expect(result.success).toBe(false);
      expect(result.error).toContain('failed after 3 attempts');
      expect(pdfExtractor.extractPdfText).toHaveBeenCalledTimes(3);
    });

    it('does not retry for unsupported file types', async () => {
      const file = createMockFile('image.jpg', 'image/jpeg');
      const result = await extractWithRetry(file, 3);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
      // Unsupported type fails immediately on each "attempt" but the result
      // is consistently a failure — extractors should not be called
      expect(pdfExtractor.extractPdfText).not.toHaveBeenCalled();
      expect(docxExtractor.extractDocxText).not.toHaveBeenCalled();
      expect(txtExtractor.extractTxtText).not.toHaveBeenCalled();
    });

    it('uses default max retries when not specified', async () => {
      const failResult: ExtractionResult = {
        success: false,
        text: '',
        error: 'Always fails',
      };

      vi.mocked(txtExtractor.extractTxtText).mockResolvedValue(failResult);

      const file = createMockFile('default-retry.txt', 'text/plain');
      const result = await extractWithRetry(file);

      expect(result.success).toBe(false);
      // Default is MAX_RETRY_ATTEMPTS = 3
      expect(txtExtractor.extractTxtText).toHaveBeenCalledTimes(3);
      expect(result.error).toContain('failed after 3 attempts');
    });

    it('works with maxRetries of 1 (no actual retry)', async () => {
      const failResult: ExtractionResult = {
        success: false,
        text: '',
        error: 'Single attempt failure',
      };

      vi.mocked(pdfExtractor.extractPdfText).mockResolvedValue(failResult);

      const file = createMockFile('single.pdf', 'application/pdf');
      const result = await extractWithRetry(file, 1);

      expect(result.success).toBe(false);
      expect(pdfExtractor.extractPdfText).toHaveBeenCalledTimes(1);
      expect(result.error).toContain('failed after 1 attempts');
    });
  });
});