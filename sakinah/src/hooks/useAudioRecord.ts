import { useState, useCallback, useRef } from 'react';
import { audioService } from '@/services/audioService';
import { storageService } from '@/services/storageService';
import { AudioFile } from '@/types/index';
import { useAuthStore } from '@/store/authStore';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface UseAudioRecordState {
  recordingState: RecordingState;
  duration: number;
  error: string | null;
  recordedFile: AudioFile | null;
  isUploading: boolean;
  uploadProgress: number;
}

export interface UseAudioRecordActions {
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<boolean>;
  pauseRecording: () => Promise<boolean>;
  resumeRecording: () => Promise<boolean>;
  uploadRecording: (recordingUri: string, projectId: string) => Promise<AudioFile | null>;
  reset: () => void;
  clearError: () => void;
}

export type UseAudioRecord = UseAudioRecordState & UseAudioRecordActions;

export function useAudioRecord(): UseAudioRecord {
  const user = useAuthStore((state) => state.user);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<AudioFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const recordingUriRef = useRef<string | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await audioService.startRecording({
        onRecordingStart: () => {
          setRecordingState('recording');
          setDuration(0);

          // Start duration tracking
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
          durationIntervalRef.current = setInterval(() => {
            const currentDuration = audioService.getRecordingDuration();
            setDuration(currentDuration);
          }, 100);
        },
        onProgress: (position: number) => {
          setDuration(position);
        },
      });

      if (!success) {
        setError('Failed to start recording. Check microphone permissions.');
        setRecordingState('idle');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error starting recording';
      setError(errorMessage);
      setRecordingState('idle');
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<boolean> => {
    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      const recordingUri = await audioService.stopRecording();
      if (!recordingUri) {
        setError('Failed to stop recording');
        return false;
      }

      recordingUriRef.current = recordingUri;
      setRecordingState('stopped');
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error stopping recording';
      setError(errorMessage);
      return false;
    }
  }, []);

  const pauseRecording = useCallback(async (): Promise<boolean> => {
    try {
      const success = await audioService.pauseRecording();
      if (success) {
        setRecordingState('paused');
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      } else {
        setError('Failed to pause recording');
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error pausing recording';
      setError(errorMessage);
      return false;
    }
  }, []);

  const resumeRecording = useCallback(async (): Promise<boolean> => {
    try {
      const success = await audioService.resumeRecording();
      if (success) {
        setRecordingState('recording');
        // Restart duration tracking
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        durationIntervalRef.current = setInterval(() => {
          const currentDuration = audioService.getRecordingDuration();
          setDuration(currentDuration);
        }, 100);
      } else {
        setError('Failed to resume recording');
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error resuming recording';
      setError(errorMessage);
      return false;
    }
  }, []);

  const uploadRecording = useCallback(
    async (recordingUri: string, projectId: string): Promise<AudioFile | null> => {
      try {
        if (!user) {
          setError('User not authenticated');
          return null;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // Validate the recording
        const { audioService: audioSvc } = await import('@/services/audioService');
        const validationResult = await audioSvc.audioService.validateAudioFile(recordingUri);

        if (!validationResult.valid) {
          setError(validationResult.error);
          setIsUploading(false);
          return null;
        }

        // Generate file name
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const fileName = `recording-${timestamp}.m4a`;

        // Upload to storage
        const audioFile = await storageService.uploadAudio(
          recordingUri,
          projectId,
          user.id,
          fileName,
          validationResult.mimeType || 'audio/mp4',
          (uploadProgress) => {
            setUploadProgress(Math.round(uploadProgress.percentage));
          }
        );

        if (!audioFile) {
          setError('Failed to upload recording');
          setIsUploading(false);
          return null;
        }

        // Set duration from validation
        if (validationResult.duration) {
          audioFile.duration = validationResult.duration;
        }

        // Save metadata
        const metadataSaved = await storageService.saveAudioMetadata(audioFile);
        if (!metadataSaved) {
          console.warn('Failed to save recording metadata, but file was uploaded');
        }

        setRecordedFile(audioFile);
        setUploadProgress(100);
        return audioFile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error uploading recording';
        setError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setRecordingState('idle');
    setDuration(0);
    setError(null);
    setRecordedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    recordingUriRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recordingState,
    duration,
    error,
    recordedFile,
    isUploading,
    uploadProgress,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    uploadRecording,
    reset,
    clearError,
  };
}
