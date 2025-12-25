import api from './api';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', {
      email,
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

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },
};
