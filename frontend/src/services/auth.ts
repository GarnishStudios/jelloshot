import api from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export const authService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  isAuthenticated() {
    return true; // Placeholder - actual check happens via API call in store
  }
};