import api from './api';

export interface LoginData {
  username: string;
  password?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

export const authService = {
  async login(data: LoginData) {
    try {
      // Use plain object format - password is optional
      // Send a placeholder password if none provided (backend accepts any password)
      const password = data.password || 'any';
      const formData = `username=${encodeURIComponent(data.username)}&password=${encodeURIComponent(password)}`;

      console.log('Attempting login for username:', data.username);
      
      const response = await api.post('/api/auth/login', formData, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      console.log('Login successful');
      return response.data;
    } catch (error: any) {
      console.error('Auth service login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  },

  async register(data: RegisterData) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};