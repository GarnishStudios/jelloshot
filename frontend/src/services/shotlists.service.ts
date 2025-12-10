import api from "./api";
import type { Shotlist } from "../types";

export const shotlistsService = {
  async getProjectShotlists(projectId: string): Promise<Shotlist[]> {
    const response = await api.get(`/api/projects/${projectId}/shotlists`);
    return response.data;
  },

  async getShotlist(id: string): Promise<Shotlist> {
    const response = await api.get(`/api/shotlists/${id}`);
    return response.data;
  },

  async createShotlist(
    projectId: string,
    data: Partial<Shotlist>,
  ): Promise<Shotlist> {
    const response = await api.post(
      `/api/projects/${projectId}/shotlists`,
      data,
    );
    return response.data;
  },

  async updateShotlist(id: string, data: Partial<Shotlist>): Promise<Shotlist> {
    const response = await api.put(`/api/shotlists/${id}`, data);
    return response.data;
  },

  async deleteShotlist(id: string): Promise<void> {
    await api.delete(`/api/shotlists/${id}`);
  },
};
