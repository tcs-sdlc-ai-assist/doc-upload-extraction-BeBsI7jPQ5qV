import type { ValidationResult } from '../types';
import { SUPPORTED_MIME_TYPES, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE, FILE_EXTENSIONS } from '../constants';

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

export function isValidFileType(file: File): boolean {
  if (SUPPORTED_MIME_TYPES.includes(file.type)) {
    return true;
  }

  const extension = getFileExtension(file.name);
  const validExtensions = Object.values(FILE_EXTENSIONS);
  return validExtensions.includes(extension);
}

export function isValidFileSize(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

export function validateFile(file: File): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided. Please select a file to upload.',
    };
  }

  if (!isValidFileType(file)) {
    const supportedTypes = Object.values(SUPPORTED_FILE_TYPES).join(', ');
    return {
      valid: false,
      error: `Unsupported file type "${file.type || getFileExtension(file.name) || 'unknown'}". Only ${supportedTypes} files are supported.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty. Please choose a file with content.',
    };
  }

  if (!isValidFileSize(file)) {
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}