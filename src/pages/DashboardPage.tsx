import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentWorkflow } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, SUPPORTED_FILE_TYPES } from '../constants';
import type { DocumentRecord } from '../types';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeLabel(fileType: string): string {
  return SUPPORTED_FILE_TYPES[fileType] ?? 'Unknown';
}

function getStatusBadgeClasses(status: DocumentRecord['extractionStatus']): string {
  switch (status) {
    case 'completed':
      return 'bg-success-100 text-success-700';
    case 'failed':
      return 'bg-error-100 text-error-700';
    case 'extracting':
      return 'bg-info-100 text-info-700';
    case 'pending':
      return 'bg-warning-100 text-warning-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}

export function DashboardPage() {
  const { documents, getDocumentHistory } = useDocumentWorkflow();
  const { user } = useAuth();
  const navigate = useNavigate();

  const sortedDocuments = getDocumentHistory();
  const recentDocuments = sortedDocuments.slice(0, 5);

  const totalDocuments = documents.length;
  const completedDocuments = documents.filter((d) => d.extractionStatus === 'completed').length;
  const failedDocuments = documents.filter((d) => d.extractionStatus === 'failed').length;
  const pendingDocuments = documents.filter(
    (d) => d.extractionStatus === 'pending' || d.extractionStatus === 'extracting'
  ).length;

  const totalSize = documents.reduce((acc, d) => acc + d.fileSize, 0);

  const handleNavigateUpload = useCallback(() => {
    navigate(ROUTES.UPLOAD);
  }, [navigate]);

  const handleNavigateHistory = useCallback(() => {
    navigate(ROUTES.HISTORY);
  }, [navigate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Welcome back{user ? `, ${user.username}` : ''}
        </h1>
        <p className="mt-1 text-neutral-500">
          Here&apos;s an overview of your document extraction activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Documents</p>
              <p className="mt-1 text-3xl font-semibold text-neutral-900">{totalDocuments}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <span className="text-xl" role="img" aria-label="Documents">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Completed</p>
              <p className="mt-1 text-3xl font-semibold text-success-700">{completedDocuments}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
              <span className="text-xl" role="img" aria-label="Completed">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Failed</p>
              <p className="mt-1 text-3xl font-semibold text-error-700">{failedDocuments}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100">
              <span className="text-xl" role="img" aria-label="Failed">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Size</p>
              <p className="mt-1 text-3xl font-semibold text-neutral-900">{formatFileSize(totalSize)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-100">
              <span className="text-xl" role="img" aria-label="Storage">💾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleNavigateUpload}
          className="flex items-center gap-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-card p-5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Upload a new document"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500">
            <span className="text-2xl" role="img" aria-label="Upload">📤</span>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">Upload Document</p>
            <p className="text-sm text-primary-200">Upload and extract text from PDF, DOCX, or TXT</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleNavigateHistory}
          className="flex items-center gap-4 bg-white hover:bg-neutral-50 text-neutral-900 rounded-xl shadow-card p-5 transition-colors border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="View document history"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
            <span className="text-2xl" role="img" aria-label="History">📋</span>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">View History</p>
            <p className="text-sm text-neutral-500">Browse and review previously uploaded documents</p>
          </div>
        </button>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Uploads</h2>
          {totalDocuments > 0 && (
            <button
              type="button"
              onClick={handleNavigateHistory}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
              aria-label="View all documents"
            >
              View all →
            </button>
          )}
        </div>

        {recentDocuments.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl" role="img" aria-label="No documents">📭</span>
            <p className="mt-3 text-neutral-500">No documents uploaded yet.</p>
            <button
              type="button"
              onClick={handleNavigateUpload}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Upload your first document"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" aria-label="Recent documents table">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-3 text-sm font-medium text-neutral-500" scope="col">File Name</th>
                  <th className="pb-3 text-sm font-medium text-neutral-500 hidden sm:table-cell" scope="col">Type</th>
                  <th className="pb-3 text-sm font-medium text-neutral-500 hidden md:table-cell" scope="col">Size</th>
                  <th className="pb-3 text-sm font-medium text-neutral-500" scope="col">Status</th>
                  <th className="pb-3 text-sm font-medium text-neutral-500 hidden lg:table-cell" scope="col">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">
                        {doc.fileName}
                      </p>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className="text-sm text-neutral-600">{getFileTypeLabel(doc.fileType)}</span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-sm text-neutral-600">{formatFileSize(doc.fileSize)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(doc.extractionStatus)}`}
                      >
                        {doc.extractionStatus}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="text-sm text-neutral-500">{formatTimestamp(doc.uploadTimestamp)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {pendingDocuments > 0 && (
        <div className="bg-info-50 border border-info-200 rounded-xl p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info-200 animate-pulse-slow">
              <span className="text-sm" role="img" aria-label="Processing">⏳</span>
            </div>
            <p className="text-sm text-info-700">
              {pendingDocuments} document{pendingDocuments > 1 ? 's' : ''} currently being processed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}