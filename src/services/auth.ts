import axios from 'axios';
import api, { API_BASE_URL } from './api';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', {
      username,
      password,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout/', {
        refresh: refreshToken,
      });
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    }
  },

  async refreshToken(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    // Use axios directly to bypass interceptors and avoid circular dependencies/race conditions
    const response = await axios.post<{ access: string; refresh?: string }>(`${API_BASE_URL}/auth/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    // The axios interceptor in api.ts handles token refresh on 401 errors
    // No need for proactive refresh here - it creates race conditions
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },
};
