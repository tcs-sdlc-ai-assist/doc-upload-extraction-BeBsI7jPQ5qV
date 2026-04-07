export interface User {
  username: string;
  passwordHash: string;
}

export interface Session {
  username: string;
  token: string;
  timestamp: number;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTimestamp: number;
  extractedText: string;
  extractionStatus: ExtractionStatus;
  errorLog?: string;
}

export interface Metadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTimestamp: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

export interface StatusMessage {
  id: string;
  type: StatusMessageType;
  message: string;
  timestamp: number;
}

export type StatusMessageType = 'success' | 'error' | 'info' | 'warning';

export type ExtractionStatus = 'pending' | 'extracting' | 'completed' | 'failed';

export type SupportedFileType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain';

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: Session;
}

export interface UploadProgress {
  fileName: string;
  percentage: number;
  status: 'uploading' | 'extracting' | 'cleaning' | 'storing' | 'complete' | 'error';
}