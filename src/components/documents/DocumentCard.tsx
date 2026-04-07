import type { DocumentRecord } from '../../types';
import { SUPPORTED_FILE_TYPES } from '../../constants';

interface DocumentCardProps {
  document: DocumentRecord;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${units[i]}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: DocumentRecord['extractionStatus']): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-success-100 text-success-700',
      };
    case 'extracting':
      return {
        label: 'Extracting…',
        className: 'bg-info-100 text-info-700 animate-pulse-slow',
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-warning-100 text-warning-700',
      };
    case 'failed':
      return {
        label: 'Failed',
        className: 'bg-error-100 text-error-700',
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-neutral-100 text-neutral-700',
      };
  }
}

function getFileTypeIcon(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return '📄';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '📝';
    case 'text/plain':
      return '📃';
    default:
      return '📎';
  }
}

export function DocumentCard({ document, isSelected = false, onSelect }: DocumentCardProps) {
  const statusBadge = getStatusBadge(document.extractionStatus);
  const fileTypeLabel = SUPPORTED_FILE_TYPES[document.fileType] ?? 'Unknown';
  const fileIcon = getFileTypeIcon(document.fileType);

  const handleClick = () => {
    if (onSelect) {
      onSelect(document.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      onSelect(document.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Document: ${document.fileName}, Status: ${statusBadge.label}`}
      aria-selected={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-xl border p-4 shadow-card transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:shadow-soft ${
        isSelected
          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
          : 'border-neutral-200 bg-white hover:border-primary-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {fileIcon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 truncate">
              {document.fileName}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>{fileTypeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{formatFileSize(document.fileSize)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={new Date(document.uploadTimestamp).toISOString()}>
              {formatTimestamp(document.uploadTimestamp)}
            </time>
          </div>
          {document.extractionStatus === 'failed' && document.errorLog && (
            <p className="mt-2 text-xs text-error-600 truncate" title={document.errorLog}>
              {document.errorLog}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}