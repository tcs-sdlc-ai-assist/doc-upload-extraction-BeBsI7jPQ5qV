import type { UploadProgress as UploadProgressType } from '../../types';

interface UploadProgressProps {
  percentage: number;
  status?: UploadProgressType['status'];
  fileName?: string;
}

function getStatusLabel(status: UploadProgressType['status']): string {
  switch (status) {
    case 'uploading':
      return 'Uploading file…';
    case 'extracting':
      return 'Extracting text…';
    case 'cleaning':
      return 'Cleaning extracted text…';
    case 'storing':
      return 'Storing document…';
    case 'complete':
      return 'Complete!';
    case 'error':
      return 'An error occurred.';
    default:
      return 'Processing…';
  }
}

function getStatusColor(status: UploadProgressType['status']): string {
  switch (status) {
    case 'complete':
      return 'bg-success-500';
    case 'error':
      return 'bg-error-500';
    default:
      return 'bg-primary-500';
  }
}

function getStatusTextColor(status: UploadProgressType['status']): string {
  switch (status) {
    case 'complete':
      return 'text-success-700';
    case 'error':
      return 'text-error-700';
    default:
      return 'text-primary-700';
  }
}

function getPhaseFromPercentage(percentage: number): UploadProgressType['status'] {
  if (percentage <= 0) return 'uploading';
  if (percentage < 20) return 'uploading';
  if (percentage < 70) return 'extracting';
  if (percentage < 85) return 'cleaning';
  if (percentage < 100) return 'storing';
  return 'complete';
}

export function UploadProgress({ percentage, status, fileName }: UploadProgressProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const resolvedStatus = status ?? getPhaseFromPercentage(clampedPercentage);
  const statusLabel = getStatusLabel(resolvedStatus);
  const barColor = getStatusColor(resolvedStatus);
  const textColor = getStatusTextColor(resolvedStatus);
  const isComplete = resolvedStatus === 'complete';
  const isError = resolvedStatus === 'error';

  return (
    <div
      className="w-full animate-fade-in"
      role="region"
      aria-label="Upload progress"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          {fileName && (
            <span className="text-sm font-medium text-neutral-800 truncate max-w-xs">
              {fileName}
            </span>
          )}
          <span className={`text-sm font-medium ${textColor}`}>
            {statusLabel}
          </span>
        </div>
        <span
          className={`text-sm font-semibold ${textColor}`}
          aria-hidden="true"
        >
          {clampedPercentage}%
        </span>
      </div>

      <div
        className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${statusLabel} ${clampedPercentage}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor} ${
            !isComplete && !isError ? 'animate-pulse-slow' : ''
          }`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {isComplete && (
        <p className="mt-2 text-sm text-success-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Document processed successfully.
        </p>
      )}

      {isError && (
        <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
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
          Processing failed. Please try again.
        </p>
      )}
    </div>
  );
}