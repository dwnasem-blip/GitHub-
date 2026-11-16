import { supabase } from '@/config/supabase';
import { Project, Profile, User } from '@/types';

export interface CreateProjectInput {
  title: string;
  description?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: 'draft' | 'processing' | 'completed' | 'failed';
}

export interface CreateProfileInput {
  full_name?: string;
  bio?: string;
  language: 'ar' | 'en';
}

export interface UpdateProfileInput {
  full_name?: string;
  bio?: string;
  language?: 'ar' | 'en';
}

/**
 * Database Service - Handles all database operations with Supabase
 * Uses RLS policies to ensure data isolation
 */
export const databaseService = {
  /**
   * Get current user's session
   */
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user's ID
   */
  async getCurrentUserId(): Promise<string> {
    const session = await this.getCurrentSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return session.user.id;
  },

  /**
   * Projects CRUD Operations
   */

  async listProjects(): Promise<Project[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProject(id: string): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Project not found');
    return data;
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create project');
    return data;
  },

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: input.title,
        description: input.description,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update project');
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Profile CRUD Operations
   */

  async getProfile(): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      // Create default profile if not exists
      return this.createDefaultProfile(userId);
    }
    return data;
  },

  private async createDefaultProfile(userId: string): Promise<Profile> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: user?.user_metadata?.full_name || null,
        bio: null,
        language: 'ar',
        avatar_url: null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create default profile');
    return data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: input.full_name,
        bio: input.bio,
        language: input.language,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const userId = await this.getCurrentUserId();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${userId}/${fileName}`;

    // For web, use File directly; for native, we'd need different handling
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Utility function to verify data isolation (RLS)
   * This should return only the user's own data
   */
  async verifyDataIsolation(): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      const projects = await this.listProjects();
      const profile = await this.getProfile();

      // Check that all projects belong to current user
      const allOwnProjects = projects.every((p) => p.user_id === userId);
      const profileBelongsToUser = profile.user_id === userId;

      return allOwnProjects && profileBelongsToUser;
    } catch (error) {
      console.error('Data isolation verification failed:', error);
      return false;
    }
  },
};
