import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;

  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),

  setSelectedProject: (selectedProject) => set({ selectedProject }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (id, projectUpdate) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...projectUpdate } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...projectUpdate }
          : state.selectedProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    })),

  reset: () =>
    set({
      projects: [],
      selectedProject: null,
      isLoading: false,
      error: null,
    }),
}));
