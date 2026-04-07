import { useDocumentWorkflow } from '../../contexts/DocumentContext';
import { DocumentCard } from './DocumentCard';
import type { DocumentRecord } from '../../types';

interface DocumentListProps {
  onSelectDocument?: (id: string) => void;
}

export function DocumentList({ onSelectDocument }: DocumentListProps) {
  const { getDocumentHistory, selectDocument } = useDocumentWorkflow();

  const documents: DocumentRecord[] = getDocumentHistory();

  const handleSelect = (id: string) => {
    selectDocument(id);
    if (onSelectDocument) {
      onSelectDocument(id);
    }
  };

  if (documents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-12 text-center"
        role="status"
        aria-label="No documents"
      >
        <svg
          className="mb-4 h-16 w-16 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-neutral-700">
          No documents yet
        </h3>
        <p className="max-w-sm text-sm text-neutral-500">
          Upload a PDF, DOCX, or TXT file to get started. Your uploaded documents and extracted text will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Document history">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">
          Document History
        </h2>
        <span className="text-sm text-neutral-500">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </span>
      </div>
      {documents.map((doc) => (
        <div
          key={doc.id}
          role="listitem"
          className="cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => handleSelect(doc.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(doc.id);
            }
          }}
          tabIndex={0}
          aria-label={`Select document ${doc.fileName}`}
        >
          <DocumentCard document={doc} />
        </div>
      ))}
    </div>
  );
}