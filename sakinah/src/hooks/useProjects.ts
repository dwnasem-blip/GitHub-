import { useCallback, useEffect, useState } from 'react';
import { Project } from '@/types';
import { projectService } from '@/services/projectService';
import { useProjectStore } from '@/store/projectStore';
import { CreateProjectInput, UpdateProjectInput } from '@/services/databaseService';

interface UseProjectsReturn {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<Project>;
  getProject: (id: string) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
  clearError: () => void;
}

/**
 * Custom hook for managing projects
 * Provides CRUD operations and state management
 */
export const useProjects = (): UseProjectsReturn => {
  const {
    projects,
    selectedProject,
    isLoading,
    error,
    setProjects,
    setSelectedProject,
    setIsLoading,
    setError,
    addProject,
    updateProject,
    removeProject,
  } = useProjectStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Load projects on mount
  useEffect(() => {
    if (!isInitialized) {
      refreshProjects();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const refreshProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.listProjects();
      setProjects(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setProjects, setIsLoading, setError]);

  const createProjectHandler = useCallback(
    async (data: CreateProjectInput): Promise<Project> => {
      try {
        setError(null);
        const newProject = await projectService.createProject(data);
        addProject(newProject);
        return newProject;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create project';
        setError(errorMessage);
        throw err;
      }
    },
    [addProject, setError]
  );

  const getProjectHandler = useCallback(
    async (id: string): Promise<Project> => {
      try {
        setError(null);
        const project = await projectService.getProject(id);
        setSelectedProject(project);
        return project;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load project';
        setError(errorMessage);
        throw err;
      }
    },
    [setSelectedProject, setError]
  );

  const updateProjectHandler = useCallback(
    async (id: string, data: UpdateProjectInput): Promise<Project> => {
      try {
        setError(null);
        const updated = await projectService.updateProject(id, data);
        updateProject(id, updated);
        setSelectedProject(updated);
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update project';
        setError(errorMessage);
        throw err;
      }
    },
    [updateProject, setSelectedProject, setError]
  );

  const deleteProjectHandler = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await projectService.deleteProject(id);
        removeProject(id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete project';
        setError(errorMessage);
        throw err;
      }
    },
    [removeProject, setError]
  );

  const selectProject = useCallback(
    (project: Project | null) => {
      setSelectedProject(project);
    },
    [setSelectedProject]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    projects,
    selectedProject,
    isLoading,
    error,
    refreshProjects,
    createProject: createProjectHandler,
    getProject: getProjectHandler,
    updateProject: updateProjectHandler,
    deleteProject: deleteProjectHandler,
    selectProject,
    clearError,
  };
};
