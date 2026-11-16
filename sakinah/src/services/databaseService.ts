import { supabase } from '@/config/supabase';
import { Project, Profile } from '@/types';

export interface CreateProjectInput { title: string; description?: string; }
export interface UpdateProjectInput { title?: string; description?: string; status?: 'draft' | 'processing' | 'completed' | 'failed'; }
export interface UpdateProfileInput { full_name?: string; bio?: string; language?: 'ar' | 'en'; }

export const databaseService = {
  async getCurrentUserId(): Promise<string> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session?.user?.id) throw new Error('User not authenticated');
    return session.user.id;
  },
  async listProjects(): Promise<Project[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async getProject(id: string): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).eq('user_id', userId).single();
    if (error) throw error;
    if (!data) throw new Error('Project not found');
    return data;
  },
  async createProject(input: CreateProjectInput): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('projects').insert({ user_id: userId, title: input.title, description: input.description || null, status: 'draft' }).select().single();
    if (error) throw error;
    return data;
  },
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('projects').update({ title: input.title, description: input.description, status: input.status, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },
  async deleteProject(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },
  async getProfile(): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return this.createDefaultProfile(userId);
    return data;
  },
  async createDefaultProfile(userId: string): Promise<Profile> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const { data, error } = await supabase.from('profiles').insert({ user_id: userId, full_name: user?.user_metadata?.full_name || null, bio: null, language: 'ar', avatar_url: null }).select().single();
    if (error) throw error;
    return data;
  },
  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase.from('profiles').update({ full_name: input.full_name, bio: input.bio, language: input.language, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },
};