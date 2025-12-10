import api from "./api";
import type { Client, Project } from "../types";

export interface ClientCreate {
  name: string;
  description?: string;
}

export interface ClientUpdate {
  name?: string;
  description?: string;
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const response = await api.get("/api/clients");
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async create(client: ClientCreate): Promise<Client> {
    const response = await api.post("/api/clients", client);
    return response.data;
  },

  async update(id: string, client: ClientUpdate): Promise<Client> {
    const response = await api.put(`/api/clients/${id}`, client);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/clients/${id}`);
  },
};
