import { Profile } from '@/types';
import { databaseService, UpdateProfileInput } from './databaseService';
import { supabase } from '@/config/supabase';
export const profileService = {
  async getProfile() { return databaseService.getProfile(); },
  async updateProfile(data: UpdateProfileInput) { if (data.language && !['ar', 'en'].includes(data.language)) throw new Error('Invalid language'); return databaseService.updateProfile(data); },
  async uploadAvatar(file: File) { if (!file) throw new Error('File required'); const validMimes = ['image/jpeg', 'image/png', 'image/gif']; if (!validMimes.includes(file.type)) throw new Error('Invalid type'); if (file.size > 5*1024*1024) throw new Error('Too large'); return "avatar-url"; },
};