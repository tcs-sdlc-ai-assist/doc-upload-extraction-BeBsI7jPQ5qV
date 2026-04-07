import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DocumentRecord, ExtractionStatus, UploadProgress } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { validateFile } from '../utils/validation';
import { cleanText } from '../utils/textCleaner';
import { extractWithRetry } from '../services/extractionService';
import { useStatusContext } from '../contexts/StatusContext';
import { useAuth } from '../contexts/AuthContext';

interface DocumentContextValue {
  documents: DocumentRecord[];
  currentDocument: DocumentRecord | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadAndExtract: (file: File) => Promise<void>;
  selectDocument: (id: string) => void;
  getDocumentHistory: () => DocumentRecord[];
  deleteDocument: (id: string) => void;
}

export const DocumentContext = createContext<DocumentContextValue | null>(null);

function generateDocumentId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getStorageKeyForUser(username: string): string {
  return `${STORAGE_KEYS.DOCUMENTS}_${username}`;
}

interface DocumentProviderProps {
  children: ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showSuccess, showError, showInfo } = useStatusContext();
  const { user, isAuthenticated } = useAuth();

  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setDocuments([]);
      setCurrentDocument(null);
      return;
    }

    try {
      const storageKey = getStorageKeyForUser(user.username);
      const storedDocs = await getStorageItem<DocumentRecord[]>(storageKey);
      if (storedDocs && Array.isArray(storedDocs)) {
        setDocuments(storedDocs);
      } else {
        setDocuments([]);
      }
    } catch {
      setDocuments([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const persistDocuments = useCallback(async (docs: DocumentRecord[]) => {
    if (!user) return;
    try {
      const storageKey = getStorageKeyForUser(user.username);
      await setStorageItem(storageKey, docs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save documents.';
      showError(`Storage error: ${message}`);
    }
  }, [user, showError]);

  const uploadAndExtract = useCallback(async (file: File) => {
    if (!user) {
      showError('You must be logged in to upload documents.');
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      showError(validation.error ?? 'Invalid file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const docId = generateDocumentId();
    const newDoc: DocumentRecord = {
      id: docId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadTimestamp: Date.now(),
      extractedText: '',
      extractionStatus: 'pending' as ExtractionStatus,
    };

    try {
      // Stage 1: Uploading (simulated - file is already in memory)
      setUploadProgress(10);

      const updatedDocsAfterUpload = [newDoc, ...documents];
      setDocuments(updatedDocsAfterUpload);
      await persistDocuments(updatedDocsAfterUpload);

      setUploadProgress(20);

      // Stage 2: Extracting
      newDoc.extractionStatus = 'extracting';
      const docsExtracting = updatedDocsAfterUpload.map((d) =>
        d.id === docId ? { ...newDoc } : d
      );
      setDocuments(docsExtracting);
      setUploadProgress(40);

      const result = await extractWithRetry(file);

      setUploadProgress(70);

      if (result.success) {
        // Stage 3: Cleaning
        const cleaned = cleanText(result.text);
        setUploadProgress(85);

        // Stage 4: Storing
        newDoc.extractedText = cleaned;
        newDoc.extractionStatus = 'completed';

        const docsCompleted = docsExtracting.map((d) =>
          d.id === docId ? { ...newDoc } : d
        );
        setDocuments(docsCompleted);
        await persistDocuments(docsCompleted);

        setUploadProgress(100);
        showSuccess(`Successfully extracted text from "${file.name}".`);
        setCurrentDocument({ ...newDoc });
      } else {
        newDoc.extractionStatus = 'failed';
        newDoc.errorLog = result.error ?? 'Unknown extraction error.';

        const docsFailed = docsExtracting.map((d) =>
          d.id === docId ? { ...newDoc } : d
        );
        setDocuments(docsFailed);
        await persistDocuments(docsFailed);

        setUploadProgress(100);
        showError(`Extraction failed for "${file.name}": ${result.error ?? 'Unknown error.'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      newDoc.extractionStatus = 'failed';
      newDoc.errorLog = errorMessage;

      const docsFailed = documents.map((d) =>
        d.id === docId ? { ...newDoc } : d
      );
      // If the doc wasn't added yet, prepend it
      const hasDoc = docsFailed.some((d) => d.id === docId);
      const finalDocs = hasDoc ? docsFailed : [{ ...newDoc }, ...documents];

      setDocuments(finalDocs);
      await persistDocuments(finalDocs);

      setUploadProgress(100);
      showError(`Upload failed for "${file.name}": ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay so the user can see 100%
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
    }
  }, [user, documents, persistDocuments, showSuccess, showError]);

  const selectDocument = useCallback((id: string) => {
    const doc = documents.find((d) => d.id === id) ?? null;
    setCurrentDocument(doc);
    if (!doc) {
      showInfo('Document not found.');
    }
  }, [documents, showInfo]);

  const getDocumentHistory = useCallback((): DocumentRecord[] => {
    return [...documents].sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
  }, [documents]);

  const deleteDocument = useCallback(async (id: string) => {
    const updatedDocs = documents.filter((d) => d.id !== id);
    setDocuments(updatedDocs);
    await persistDocuments(updatedDocs);

    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }

    showSuccess('Document deleted successfully.');
  }, [documents, currentDocument, persistDocuments, showSuccess]);

  const value: DocumentContextValue = {
    documents,
    currentDocument,
    isUploading,
    uploadProgress,
    uploadAndExtract,
    selectDocument,
    getDocumentHistory,
    deleteDocument,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentWorkflow(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentWorkflow must be used within a DocumentProvider.');
  }
  return context;
}