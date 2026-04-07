import type { DocumentRecord } from '../../types';
import { SUPPORTED_FILE_TYPES } from '../../constants';

interface DocumentDetailProps {
  document: DocumentRecord | null;
  onClose?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-success-100 text-success-700';
    case 'extracting':
      return 'bg-info-100 text-info-700';
    case 'pending':
      return 'bg-warning-100 text-warning-700';
    case 'failed':
      return 'bg-error-100 text-error-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}

function getFileTypeLabel(fileType: string): string {
  return SUPPORTED_FILE_TYPES[fileType] ?? fileType;
}

export function DocumentDetail({ document, onClose }: DocumentDetailProps) {
  if (!document) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-12 text-center"
        role="region"
        aria-label="Document detail"
      >
        <svg
          className="mb-4 h-16 w-16 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium text-neutral-500">
          No document selected
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          Select a document from the list to view its details.
        </p>
      </div>
    );
  }

  const statusLabel = document.extractionStatus.charAt(0).toUpperCase() + document.extractionStatus.slice(1);

  return (
    <div
      className="animate-fade-in rounded-2xl border border-neutral-200 bg-white shadow-card"
      role="region"
      aria-label={`Document detail: ${document.fileName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-200 p-6">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-neutral-900">
            {document.fileName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(document.extractionStatus)}`}
            >
              {statusLabel}
            </span>
            <span className="text-sm text-neutral-500">
              {getFileTypeLabel(document.fileType)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Close document detail"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Metadata
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-neutral-400">File Name</dt>
            <dd className="mt-0.5 truncate text-sm text-neutral-800">
              {document.fileName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">File Type</dt>
            <dd className="mt-0.5 text-sm text-neutral-800">
              {getFileTypeLabel(document.fileType)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">File Size</dt>
            <dd className="mt-0.5 text-sm text-neutral-800">
              {formatFileSize(document.fileSize)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">Uploaded</dt>
            <dd className="mt-0.5 text-sm text-neutral-800">
              {formatTimestamp(document.uploadTimestamp)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">Status</dt>
            <dd className="mt-0.5 text-sm text-neutral-800">
              {statusLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">Document ID</dt>
            <dd className="mt-0.5 truncate font-mono text-xs text-neutral-600">
              {document.id}
            </dd>
          </div>
        </dl>
      </div>

      {/* Error Log */}
      {document.extractionStatus === 'failed' && document.errorLog && (
        <div className="border-b border-error-200 bg-error-50 px-6 py-4">
          <h3 className="mb-2 text-sm font-semibold text-error-700">
            Error Details
          </h3>
          <p className="text-sm text-error-600">{document.errorLog}</p>
        </div>
      )}

      {/* Extracted Text */}
      <div className="p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Extracted Text
        </h3>
        {document.extractionStatus === 'completed' && document.extractedText ? (
          <div
            className="max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            role="region"
            aria-label="Extracted text content"
            tabIndex={0}
          >
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-neutral-800">
              {document.extractedText}
            </pre>
          </div>
        ) : document.extractionStatus === 'completed' && !document.extractedText ? (
          <div className="rounded-xl border border-warning-200 bg-warning-50 p-4">
            <p className="text-sm text-warning-700">
              No text content was extracted from this document. The file may be empty or contain only non-text content (e.g., images).
            </p>
          </div>
        ) : document.extractionStatus === 'extracting' || document.extractionStatus === 'pending' ? (
          <div className="flex items-center gap-3 rounded-xl border border-info-200 bg-info-50 p-4">
            <svg
              className="h-5 w-5 animate-spin text-info-600"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-info-700">
              {document.extractionStatus === 'extracting'
                ? 'Text extraction is in progress...'
                : 'Waiting to begin extraction...'}
            </p>
          </div>
        ) : document.extractionStatus === 'failed' ? (
          <div className="rounded-xl border border-error-200 bg-error-50 p-4">
            <p className="text-sm text-error-700">
              Text extraction failed for this document. Please try uploading the file again.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}