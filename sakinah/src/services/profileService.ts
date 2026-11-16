import { Profile } from '@/types';
import {
  databaseService,
  UpdateProfileInput,
} from './databaseService';

/**
 * Profile Service Interface
 */
export interface IProfileService {
  getProfile(): Promise<Profile>;
  updateProfile(data: UpdateProfileInput): Promise<Profile>;
  uploadAvatar(file: File): Promise<string>;
}

/**
 * Profile Service Implementation
 * Provides profile management operations with built-in RLS verification
 */
export const profileService: IProfileService = {
  async getProfile() {
    return databaseService.getProfile();
  },

  async updateProfile(data: UpdateProfileInput) {
    // Validate input
    if (data.full_name !== undefined && data.full_name.trim() === '') {
      throw new Error('Full name cannot be empty');
    }
    if (data.language && !['ar', 'en'].includes(data.language)) {
      throw new Error('Invalid language. Must be "ar" or "en"');
    }

    return databaseService.updateProfile({
      full_name: data.full_name?.trim(),
      bio: data.bio?.trim(),
      language: data.language,
    });
  },

  async uploadAvatar(file: File) {
    // Validate file
    if (!file) {
      throw new Error('File is required');
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      throw new Error('Invalid file type. Must be JPEG, PNG, or GIF');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return databaseService.uploadAvatar(file);
  },
};
