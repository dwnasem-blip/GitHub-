import { useState, useCallback } from 'react';
import { AudioFile } from '@/types/index';
import { audioService, ValidationResult } from '@/services/audioService';
import { storageService, UploadProgress } from '@/services/storageService';
import { useAuthStore } from '@/store/authStore';

export interface UseAudioUploadState {
  isValidating: boolean;
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: AudioFile | null;
  validationResult: ValidationResult | null;
}

export interface UseAudioUploadActions {
  validateFile: (fileUri: string) => Promise<ValidationResult>;
  uploadFile: (fileUri: string, fileName: string, projectId: string) => Promise<AudioFile | null>;
  reset: () => void;
  clearError: () => void;
}

export type UseAudioUpload = UseAudioUploadState & UseAudioUploadActions;

export function useAudioUpload(): UseAudioUpload {
  const user = useAuthStore((state) => state.user);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateFile = useCallback(
    async (fileUri: string): Promise<ValidationResult> => {
      try {
        setIsValidating(true);
        setError(null);
        const result = await audioService.validateAudioFile(fileUri);
        setValidationResult(result);
        if (!result.valid) {
          setError(result.error);
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error validating file';
        setError(errorMessage);
        return {
          valid: false,
          error: errorMessage,
        };
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const uploadFile = useCallback(
    async (
      fileUri: string,
      fileName: string,
      projectId: string
    ): Promise<AudioFile | null> => {
      try {
        if (!user) {
          setError('User not authenticated');
          return null;
        }

        // Validate first
        const validationResult = await validateFile(fileUri);
        if (!validationResult.valid) {
          return null;
        }

        setIsUploading(true);
        setError(null);
        setProgress(0);

        // Upload to storage
        const audioFile = await storageService.uploadAudio(
          fileUri,
          projectId,
          user.id,
          fileName,
          validationResult.mimeType || 'audio/mpeg',
          (uploadProgress: UploadProgress) => {
            setProgress(Math.round(uploadProgress.percentage));
          }
        );

        if (!audioFile) {
          setError('Failed to upload file');
          return null;
        }

        // Set duration from validation
        if (validationResult.duration) {
          audioFile.duration = validationResult.duration;
        }

        // Save metadata to database
        const metadataSaved = await storageService.saveAudioMetadata(audioFile);
        if (!metadataSaved) {
          console.warn('Failed to save audio metadata, but file was uploaded');
        }

        setUploadedFile(audioFile);
        setProgress(100);
        return audioFile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error uploading file';
        setError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user, validateFile]
  );

  const reset = useCallback(() => {
    setIsValidating(false);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
    setValidationResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isValidating,
    isUploading,
    progress,
    error,
    uploadedFile,
    validationResult,
    validateFile,
    uploadFile,
    reset,
    clearError,
  };
}
