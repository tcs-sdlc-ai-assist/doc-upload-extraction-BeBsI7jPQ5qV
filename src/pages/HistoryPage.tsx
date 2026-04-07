import { useState, useCallback } from 'react';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentDetail } from '../components/documents/DocumentDetail';
import { useDocumentWorkflow } from '../contexts/DocumentContext';

export function HistoryPage() {
  const { currentDocument, selectDocument, deleteDocument, documents } = useDocumentWorkflow();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectDocument = useCallback((id: string) => {
    setSelectedId(id);
    selectDocument(id);
  }, [selectDocument]);

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteDocument(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [deleteDocument, selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Document History
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Browse and view your previously uploaded documents.
          </p>
        </div>
        <div className="text-sm text-neutral-500">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedId && currentDocument ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <DocumentList onSelectDocument={handleSelectDocument} />
        </div>

        {selectedId && currentDocument && (
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <DocumentDetail
                document={currentDocument}
                onClose={handleCloseDetail}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(currentDocument.id)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-error-700 bg-error-50 border border-error-200 rounded-lg hover:bg-error-100 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 transition-colors"
                  aria-label={`Delete document ${currentDocument.fileName}`}
                >
                  🗑️ Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}