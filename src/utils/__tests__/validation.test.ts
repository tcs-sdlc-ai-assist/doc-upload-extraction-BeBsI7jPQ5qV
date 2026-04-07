import { describe, it, expect } from 'vitest';
import { validateFile, isValidFileType, isValidFileSize, getFileExtension } from '../validation';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '../../constants';

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Uint8Array(size);
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('getFileExtension', () => {
  it('returns the correct extension for a standard filename', () => {
    expect(getFileExtension('document.pdf')).toBe('.pdf');
  });

  it('returns the correct extension for a DOCX file', () => {
    expect(getFileExtension('report.docx')).toBe('.docx');
  });

  it('returns the correct extension for a TXT file', () => {
    expect(getFileExtension('notes.txt')).toBe('.txt');
  });

  it('returns lowercase extension regardless of input case', () => {
    expect(getFileExtension('Document.PDF')).toBe('.pdf');
    expect(getFileExtension('Report.DOCX')).toBe('.docx');
  });

  it('returns empty string when there is no extension', () => {
    expect(getFileExtension('noextension')).toBe('');
  });

  it('returns the last extension for files with multiple dots', () => {
    expect(getFileExtension('my.file.name.pdf')).toBe('.pdf');
  });

  it('returns empty string for empty filename', () => {
    expect(getFileExtension('')).toBe('');
  });
});

describe('isValidFileType', () => {
  it('returns true for PDF files', () => {
    const file = createMockFile('test.pdf', 1024, 'application/pdf');
    expect(isValidFileType(file)).toBe(true);
  });

  it('returns true for DOCX files', () => {
    const file = createMockFile(
      'test.docx',
      1024,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(isValidFileType(file)).toBe(true);
  });

  it('returns true for TXT files', () => {
    const file = createMockFile('test.txt', 1024, 'text/plain');
    expect(isValidFileType(file)).toBe(true);
  });

  it('returns false for unsupported file types', () => {
    const file = createMockFile('image.png', 1024, 'image/png');
    expect(isValidFileType(file)).toBe(false);
  });

  it('returns false for executable files', () => {
    const file = createMockFile('malware.exe', 1024, 'application/x-msdownload');
    expect(isValidFileType(file)).toBe(false);
  });

  it('falls back to extension check when MIME type is empty', () => {
    const file = createMockFile('document.pdf', 1024, '');
    expect(isValidFileType(file)).toBe(true);
  });

  it('falls back to extension check for .docx with empty MIME', () => {
    const file = createMockFile('document.docx', 1024, '');
    expect(isValidFileType(file)).toBe(true);
  });

  it('falls back to extension check for .txt with empty MIME', () => {
    const file = createMockFile('notes.txt', 1024, '');
    expect(isValidFileType(file)).toBe(true);
  });

  it('returns false for unknown extension with empty MIME', () => {
    const file = createMockFile('data.xyz', 1024, '');
    expect(isValidFileType(file)).toBe(false);
  });
});

describe('isValidFileSize', () => {
  it('returns true for a file within the size limit', () => {
    const file = createMockFile('test.pdf', 1024, 'application/pdf');
    expect(isValidFileSize(file)).toBe(true);
  });

  it('returns true for a file exactly at the size limit', () => {
    const file = createMockFile('test.pdf', MAX_FILE_SIZE, 'application/pdf');
    expect(isValidFileSize(file)).toBe(true);
  });

  it('returns false for a file exceeding the size limit', () => {
    const file = createMockFile('test.pdf', MAX_FILE_SIZE + 1, 'application/pdf');
    expect(isValidFileSize(file)).toBe(false);
  });

  it('returns false for an empty file (0 bytes)', () => {
    const file = createMockFile('empty.pdf', 0, 'application/pdf');
    expect(isValidFileSize(file)).toBe(false);
  });

  it('returns true for a 1-byte file', () => {
    const file = createMockFile('tiny.txt', 1, 'text/plain');
    expect(isValidFileSize(file)).toBe(true);
  });
});

describe('validateFile', () => {
  it('returns valid for a supported PDF file within size limits', () => {
    const file = createMockFile('document.pdf', 5000, 'application/pdf');
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid for a supported DOCX file within size limits', () => {
    const file = createMockFile(
      'report.docx',
      5000,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid for a supported TXT file within size limits', () => {
    const file = createMockFile('notes.txt', 500, 'text/plain');
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error for unsupported file type', () => {
    const file = createMockFile('image.png', 1024, 'image/png');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Unsupported file type');
    // Should mention supported types
    const supportedTypes = Object.values(SUPPORTED_FILE_TYPES).join(', ');
    expect(result.error).toContain(supportedTypes);
  });

  it('returns error for empty file (0 bytes)', () => {
    const file = createMockFile('empty.pdf', 0, 'application/pdf');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('empty');
  });

  it('returns error for file exceeding size limit', () => {
    const file = createMockFile('huge.pdf', MAX_FILE_SIZE + 1, 'application/pdf');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('exceeds');
    expect(result.error).toContain('MB');
  });

  it('returns valid for a file exactly at the size limit', () => {
    const file = createMockFile('exact.pdf', MAX_FILE_SIZE, 'application/pdf');
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns error with descriptive message for unsupported MIME type', () => {
    const file = createMockFile('spreadsheet.xlsx', 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Unsupported file type');
  });

  it('includes file size information in the error message for oversized files', () => {
    const oversizeBytes = MAX_FILE_SIZE + 1024 * 1024; // MAX + 1MB
    const file = createMockFile('large.pdf', oversizeBytes, 'application/pdf');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('MB');
  });

  it('validates file type before checking size', () => {
    // An unsupported file that is also too large should report type error
    const file = createMockFile('video.mp4', MAX_FILE_SIZE + 1, 'video/mp4');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Unsupported file type');
  });

  it('handles file with no MIME type but valid extension', () => {
    const file = createMockFile('document.pdf', 1024, '');
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('handles file with no MIME type and invalid extension', () => {
    const file = createMockFile('data.xyz', 1024, '');
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported file type');
  });
});