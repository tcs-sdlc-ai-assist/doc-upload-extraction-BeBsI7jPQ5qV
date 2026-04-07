import { useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { SUPPORTED_FILE_TYPES, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from '../../constants';

export function DropZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isDragging,
    isUploading,
    error,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
  } = useFileUpload();

  const supportedTypeLabels = Object.values(SUPPORTED_FILE_TYPES).join(', ');
  const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
  const acceptString = SUPPORTED_MIME_TYPES.join(',');

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Drop zone for file upload. Supported file types: ${supportedTypeLabels}. Maximum file size: ${maxSizeMB} MB. Press Enter or Space to open file picker.`}
        aria-disabled={isUploading}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[16rem] p-8
          border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isDragging
            ? 'border-primary-500 bg-primary-50 shadow-soft'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50'
          }
          ${isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={`
              flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-200
              ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-neutral-200 text-neutral-500'}
            `}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {isDragging ? (
            <p className="text-lg font-semibold text-primary-600 animate-fade-in">
              Drop your file here
            </p>
          ) : (
            <>
              <div>
                <p className="text-lg font-semibold text-neutral-700">
                  Drag & drop your file here
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  or click to browse your files
                </p>
              </div>

              <button
                type="button"
                onClick={handleButtonClick}
                disabled={isUploading}
                aria-label="Browse files to upload"
                className="
                  px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl
                  hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500
                  focus:ring-offset-2 transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Browse Files
              </button>
            </>
          )}

          <div className="flex flex-col items-center space-y-1 pt-2">
            <p className="text-xs text-neutral-400">
              Supported formats: <span className="font-medium text-neutral-500">{supportedTypeLabels}</span>
            </p>
            <p className="text-xs text-neutral-400">
              Maximum file size: <span className="font-medium text-neutral-500">{maxSizeMB} MB</span>
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 p-3 bg-error-50 border border-error-200 rounded-xl text-sm text-error-700 animate-fade-in"
        >
          <div className="flex items-start space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}