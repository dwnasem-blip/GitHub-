import { Project } from '@/types';
import { databaseService, CreateProjectInput, UpdateProjectInput } from './databaseService';
export const projectService = {
  async listProjects() { return databaseService.listProjects(); },
  async getProject(id: string) { if (!id) throw new Error('ID required'); return databaseService.getProject(id); },
  async createProject(data: CreateProjectInput) { if (!data.title?.trim()) throw new Error('Title required'); return databaseService.createProject(data); },
  async updateProject(id: string, data: UpdateProjectInput) { if (!id) throw new Error('ID required'); return databaseService.updateProject(id, data); },
  async deleteProject(id: string) { if (!id) throw new Error('ID required'); return databaseService.deleteProject(id); },
};