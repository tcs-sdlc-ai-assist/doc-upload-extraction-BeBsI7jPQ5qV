import { useState, useCallback, useRef } from 'react';
import { validateFile } from '../utils/validation';
import { useDocumentWorkflow } from '../contexts/DocumentContext';
import { useStatusContext } from '../contexts/StatusContext';

interface UseFileUploadReturn {
  isDragging: boolean;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetUpload: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);

  const { isUploading, uploadProgress, uploadAndExtract } = useDocumentWorkflow();
  const { showError, showSuccess } = useStatusContext();

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationResult = validateFile(file);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error ?? 'Invalid file.';
        setError(errorMessage);
        showError(errorMessage);
        return;
      }

      try {
        await uploadAndExtract(file);
        showSuccess(`Successfully extracted text from "${file.name}".`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
        setError(errorMessage);
        showError(errorMessage);
      }
    },
    [uploadAndExtract, showError, showSuccess]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (isUploading) {
        showError('Please wait for the current upload to complete.');
        return;
      }

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        if (files.length > 1) {
          const msg = 'Only one file can be uploaded at a time. The first file will be used.';
          showError(msg);
        }
        const file = files[0];
        processFile(file);
      }
    },
    [isUploading, processFile, showError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUploading) {
        showError('Please wait for the current upload to complete.');
        return;
      }

      const { files } = e.target;
      if (files && files.length > 0) {
        const file = files[0];
        processFile(file);
      }

      // Reset the input value so the same file can be selected again
      e.target.value = '';
    },
    [isUploading, processFile, showError]
  );

  const resetUpload = useCallback(() => {
    setError(null);
    setIsDragging(false);
    dragCounterRef.current = 0;
  }, []);

  return {
    isDragging,
    uploadProgress,
    isUploading,
    error,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    resetUpload,
  };
}