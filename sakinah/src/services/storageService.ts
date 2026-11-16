import { supabase } from '@/config/supabase';
import { AudioFile } from '@/types/index';
import * as FileSystem from 'expo-file-system';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class StorageService {
  private static BUCKET_NAME = 'audio-files';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  /**
   * Upload audio file to Supabase Storage
   */
  async uploadAudio(
    fileUri: string,
    projectId: string,
    userId: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AudioFile | null> {
    try {
      const audioId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const storagePath = `${userId}/${projectId}/${audioId}`;

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary
      const binaryData = this.base64ToBinary(base64Data);

      // Upload with retry logic
      const uploadedPath = await this.uploadWithRetry(
        storagePath,
        binaryData,
        mimeType,
        onProgress
      );

      if (!uploadedPath) {
        return null;
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSizeBytes = fileInfo.size || 0;

      // Create audio file record
      const audioFile: AudioFile = {
        id: audioId,
        project_id: projectId,
        user_id: userId,
        file_name: fileName,
        file_url: uploadedPath,
        duration: 0, // Will be set by the caller or calculated
        size: fileSizeBytes,
        mime_type: mimeType,
        created_at: new Date().toISOString(),
      };

      return audioFile;
    } catch (error) {
      console.error('Error uploading audio:', error);
      return null;
    }
  }

  /**
   * Upload with retry logic
   */
  private async uploadWithRetry(
    path: string,
    data: ArrayBuffer,
    mimeType: string,
    onProgress?: (progress: UploadProgress) => void,
    attempt = 1
  ): Promise<string | null> {
    try {
      const { data: uploadData, error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .upload(path, data, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!uploadData?.path) {
        throw new Error('No path returned from upload');
      }

      // Report 100% progress
      onProgress?.({
        loaded: 1,
        total: 1,
        percentage: 100,
      });

      // Return public URL
      const { data: publicUrl } = supabase.storage
        .from(StorageService.BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      return publicUrl.publicUrl;
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`Upload attempt ${attempt} failed, retrying...`, error);
        await this.delay(this.retryDelay * attempt);
        return this.uploadWithRetry(
          path,
          data,
          mimeType,
          onProgress,
          attempt + 1
        );
      }
      console.error(`Upload failed after ${this.maxRetries} attempts:`, error);
      return null;
    }
  }

  /**
   * Delete audio file from storage
   */
  async deleteAudio(audioId: string, projectId: string, userId: string): Promise<boolean> {
    try {
      const path = `${userId}/${projectId}/${audioId}`;

      const { error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Error deleting audio:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
  }

  /**
   * Get public URL for audio file
   */
  getPublicUrl(audioId: string, projectId: string, userId: string): string {
    const path = `${userId}/${projectId}/${audioId}`;
    const { data } = supabase.storage
      .from(StorageService.BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Check if file exists in storage
   */
  async fileExists(audioId: string, projectId: string, userId: string): Promise<boolean> {
    try {
      const path = `${userId}/${projectId}/${audioId}`;
      const { data, error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .list(`${userId}/${projectId}`, {
          limit: 1,
          offset: 0,
        });

      if (error) return false;
      return data?.some((file) => file.name === audioId) || false;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  /**
   * List all audio files in a project
   */
  async listAudioFiles(projectId: string, userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(StorageService.BUCKET_NAME)
        .list(`${userId}/${projectId}`);

      if (error) {
        console.error('Error listing audio files:', error);
        return [];
      }

      return data?.map((file) => file.name) || [];
    } catch (error) {
      console.error('Error listing audio files:', error);
      return [];
    }
  }

  /**
   * Save audio file metadata to database
   */
  async saveAudioMetadata(audioFile: AudioFile): Promise<boolean> {
    try {
      const { error } = await supabase.from('audio_files').insert([
        {
          id: audioFile.id,
          project_id: audioFile.project_id,
          user_id: audioFile.user_id,
          file_name: audioFile.file_name,
          file_url: audioFile.file_url,
          duration: audioFile.duration,
          size: audioFile.size,
          mime_type: audioFile.mime_type,
          created_at: audioFile.created_at,
        },
      ]);

      if (error) {
        console.error('Error saving audio metadata:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving audio metadata:', error);
      return false;
    }
  }

  /**
   * Get audio file metadata from database
   */
  async getAudioMetadata(audioId: string): Promise<AudioFile | null> {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .eq('id', audioId)
        .single();

      if (error) {
        console.error('Error getting audio metadata:', error);
        return null;
      }

      return data as AudioFile;
    } catch (error) {
      console.error('Error getting audio metadata:', error);
      return null;
    }
  }

  /**
   * Delete audio metadata from database
   */
  async deleteAudioMetadata(audioId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('audio_files').delete().eq('id', audioId);

      if (error) {
        console.error('Error deleting audio metadata:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting audio metadata:', error);
      return false;
    }
  }

  /**
   * Get all audio files for a project from database
   */
  async getProjectAudioFiles(projectId: string): Promise<AudioFile[]> {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting project audio files:', error);
        return [];
      }

      return (data as AudioFile[]) || [];
    } catch (error) {
      console.error('Error getting project audio files:', error);
      return [];
    }
  }

  /**
   * Helper: Convert base64 to binary
   */
  private base64ToBinary(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Helper: Delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const storageService = new StorageService();
