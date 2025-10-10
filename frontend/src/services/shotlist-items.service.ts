import api from './api';
import type { ShotlistItem } from '../types';

export const shotlistItemsService = {
  async getShotlistItems(shotlistId: string): Promise<ShotlistItem[]> {
    const response = await api.get(`/api/shotlists/${shotlistId}/items`);
    return response.data;
  },

  async createItem(shotlistId: string, data: Partial<ShotlistItem>): Promise<ShotlistItem> {
    const response = await api.post(`/api/shotlists/${shotlistId}/items`, data);
    return response.data;
  },

  async updateItem(id: string, data: Partial<ShotlistItem>): Promise<ShotlistItem> {
    const response = await api.put(`/api/shotlist-items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/api/shotlist-items/${id}`);
  },

  async reorderItems(shotlistId: string, itemIds: string[]): Promise<ShotlistItem[]> {
    const items = itemIds.map((item_id, index) => ({
      item_id,
      new_index: index
    }));

    const response = await api.put(`/api/shotlists/${shotlistId}/items/reorder`, {
      items
    });
    return response.data;
  },

  async uploadImage(itemId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/shotlist-items/${itemId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};