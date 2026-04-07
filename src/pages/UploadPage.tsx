import { DropZone } from '../components/upload/DropZone';
import { UploadProgress } from '../components/upload/UploadProgress';
import { StatusMessage } from '../components/common/StatusMessage';
import { useDocumentWorkflow } from '../contexts/DocumentContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '../constants';

export function UploadPage() {
  const { isUploading, uploadProgress, currentDocument } = useDocumentWorkflow();
  const { error } = useFileUpload();

  const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES).join(', ');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Upload Document</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload a document to extract its text content. Supported formats: {supportedTypes}. Maximum file size: {maxSizeMB} MB.
        </p>
      </div>

      <StatusMessage />

      <div className="bg-white rounded-2xl shadow-card p-6">
        <DropZone />

        {isUploading && (
          <div className="mt-6">
            <UploadProgress percentage={uploadProgress} />
          </div>
        )}

        {error && !isUploading && (
          <div
            className="mt-4 p-3 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      {currentDocument && currentDocument.extractionStatus === 'completed' && !isUploading && (
        <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Extraction Result
          </h2>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">📄</span>
              {currentDocument.fileName}
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">📏</span>
              {(currentDocument.fileSize / 1024).toFixed(1)} KB
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-100 text-success-700 text-xs font-medium">
              Completed
            </span>
          </div>
          <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words text-sm text-neutral-800 font-mono leading-relaxed">
              {currentDocument.extractedText || 'No text content was extracted from this document.'}
            </pre>
          </div>
        </div>
      )}

      {currentDocument && currentDocument.extractionStatus === 'failed' && !isUploading && (
        <div
          className="bg-white rounded-2xl shadow-card p-6 animate-fade-in"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-error-700 mb-2">
            Extraction Failed
          </h2>
          <p className="text-sm text-neutral-600">
            {currentDocument.errorLog || 'An unknown error occurred during text extraction. Please try uploading the file again.'}
          </p>
        </div>
      )}

      <div className="bg-info-50 border border-info-200 rounded-xl p-4">
        <h3 className="text-sm font-medium text-info-700 mb-1">Tips for best results</h3>
        <ul className="text-sm text-info-600 list-disc list-inside space-y-1">
          <li>PDF files with selectable text work best. Scanned/image-only PDFs may not yield results.</li>
          <li>DOCX files are converted to plain text — formatting and images will be removed.</li>
          <li>TXT files are read as-is with UTF-8 encoding.</li>
          <li>Maximum file size is {maxSizeMB} MB.</li>
        </ul>
      </div>
    </div>
  );
}