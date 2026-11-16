import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { AudioFile } from '@/types/index';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
  size?: number;
  mimeType?: string;
}

export interface RecordingOptions {
  onProgress?: (position: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  projectId: string;
  userId: string;
}

const SUPPORTED_FORMATS = ['mp3', 'm4a', 'wav'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
};

export class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private recordingTime = 0;
  private recordingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio session
   */
  private async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  /**
   * Validate audio file format, size, and get metadata
   */
  async validateAudioFile(fileUri: string): Promise<ValidationResult> {
    try {
      // Get file extension
      const fileName = fileUri.split('/').pop() || '';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      // Validate format
      if (!SUPPORTED_FORMATS.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
        };
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return {
          valid: false,
          error: 'File does not exist',
        };
      }

      const fileSize = fileInfo.size || 0;
      if (fileSize > MAX_FILE_SIZE) {
        const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(2);
        return {
          valid: false,
          error: `File size (${sizeMB}MB) exceeds maximum (${maxMB}MB)`,
        };
      }

      // Get audio duration and metadata
      let duration = 0;
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: false }
        );
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          duration = status.durationMillis || 0;
        }
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error getting audio duration:', error);
        // Continue anyway - duration is optional
      }

      return {
        valid: true,
        duration,
        size: fileSize,
        mimeType: MIME_TYPES[extension] || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error validating audio file:', error);
      return {
        valid: false,
        error: 'Error validating file',
      };
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options?: RecordingOptions): Promise<boolean> {
    try {
      // Request permission
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('Audio recording permission not granted');
        return false;
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.recordingTime = 0;

      // Setup progress tracking
      if (options?.onProgress) {
        this.recordingInterval = setInterval(() => {
          this.recordingTime += 100;
          options.onProgress?.(this.recordingTime);
        }, 100);
      }

      options?.onRecordingStart?.();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and return file URI
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        console.error('No active recording');
        return null;
      }

      // Clear interval
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
      }

      await this.recording.stopAndUnloadAsync();
      const fileUri = this.recording.getURI();
      this.recording = null;

      return fileUri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  /**
   * Pause recording
   */
  async pauseRecording(): Promise<boolean> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing recording:', error);
      return false;
    }
  }

  /**
   * Resume recording
   */
  async resumeRecording(): Promise<boolean> {
    try {
      if (this.recording) {
        await this.recording.resumeAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming recording:', error);
      return false;
    }
  }

  /**
   * Get recording duration
   */
  getRecordingDuration(): number {
    return this.recordingTime;
  }

  /**
   * Play audio file
   */
  async playAudio(fileUri: string): Promise<boolean> {
    try {
      // Stop previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      this.sound = sound;
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  /**
   * Stop audio playback
   */
  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  /**
   * Pause audio playback
   */
  async pauseAudio(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing audio:', error);
      return false;
    }
  }

  /**
   * Resume audio playback
   */
  async resumeAudio(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.resumeAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming audio:', error);
      return false;
    }
  }

  /**
   * Get current playback position
   */
  async getPlaybackStatus(): Promise<Partial<Audio.AVPlaybackStatus> | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting playback status:', error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
      }
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      if (this.sound) {
        await this.sound.unloadAsync();
      }
    } catch (error) {
      console.error('Error cleaning up audio resources:', error);
    }
  }

  /**
   * Format duration in milliseconds to MM:SS string
   */
  static formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Format file size in bytes to human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// Export singleton instance
export const audioService = new AudioService();
