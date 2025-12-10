import api from "./api";
import type { CrewMember } from "../types";

export const crewService = {
  async getProjectCrew(projectId: string): Promise<CrewMember[]> {
    const response = await api.get(`/api/projects/${projectId}/crew`);
    return response.data;
  },

  async createCrewMember(
    projectId: string,
    data: Partial<CrewMember>,
  ): Promise<CrewMember> {
    const response = await api.post(`/api/projects/${projectId}/crew`, data);
    return response.data;
  },

  async updateCrewMember(
    id: string,
    data: Partial<CrewMember>,
  ): Promise<CrewMember> {
    const response = await api.put(`/api/crew/${id}`, data);
    return response.data;
  },

  async deleteCrewMember(id: string): Promise<void> {
    await api.delete(`/api/crew/${id}`);
  },
};
