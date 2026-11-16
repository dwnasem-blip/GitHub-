import { Project } from '@/types';
import { databaseService, CreateProjectInput, UpdateProjectInput } from './databaseService';

export const projectService = {
  async listProjects() {
    return databaseService.listProjects();
  },
  async getProject(id: string) {
    if (!id) throw new Error('Project ID is required');
    return databaseService.getProject(id);
  },
  async createProject(data: CreateProjectInput) {
    if (!data.title || data.title.trim() === '') throw new Error('Project title is required');
    return databaseService.createProject({ title: data.title.trim(), description: data.description?.trim() });
  },
  async updateProject(id: string, data: UpdateProjectInput) {
    if (!id) throw new Error('Project ID is required');
    if (data.title !== undefined && data.title.trim() === '') throw new Error('Project title cannot be empty');
    return databaseService.updateProject(id, { title: data.title?.trim(), description: data.description?.trim(), status: data.status });
  },
  async deleteProject(id: string) {
    if (!id) throw new Error('Project ID is required');
    return databaseService.deleteProject(id);
  },
};
