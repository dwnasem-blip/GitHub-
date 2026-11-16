import { Profile } from '@/types';
import { databaseService, UpdateProfileInput } from './databaseService';

export const profileService = {
  async getProfile() {
    return databaseService.getProfile();
  },
  async updateProfile(data: UpdateProfileInput) {
    if (data.full_name !== undefined && data.full_name.trim() === '') throw new Error('Full name cannot be empty');
    if (data.language && !['ar', 'en'].includes(data.language)) throw new Error('Invalid language');
    return databaseService.updateProfile({ full_name: data.full_name?.trim(), bio: data.bio?.trim(), language: data.language });
  },
  async uploadAvatar(file: File) {
    if (!file) throw new Error('File is required');
    const validMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimes.includes(file.type)) throw new Error('Invalid file type');
    if (file.size > 5 * 1024 * 1024) throw new Error('File size must be less than 5MB');
    const userId = await databaseService.getCurrentUserId();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${userId}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return data.publicUrl;
  },
};

import { supabase } from '@/config/supabase';
