import api from "./api";
import type { Project } from "../types";

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get("/api/projects");
    return response.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await api.get("/api/projects");
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  async create(data: Partial<Project>): Promise<Project> {
    const response = await api.post("/api/projects", data);
    return response.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await api.post("/api/projects", data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/api/projects/${id}`);
  },
};
