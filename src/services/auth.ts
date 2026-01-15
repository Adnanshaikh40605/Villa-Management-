import axios from 'axios';
import api, { API_BASE_URL } from './api';
import { isTokenExpiringSoon } from '@/utils/jwt';

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
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    // Proactively refresh if token is expiring soon (within 5 minutes)
    if (token && refreshToken && isTokenExpiringSoon(token)) {
      try {
        const { access, refresh } = await this.refreshToken(refreshToken);
        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
      } catch (error) {
        // If refresh fails, continue to API call which will likely fail with 401
        // and trigger the interceptor or strictly fail if refresh token is dead
        console.warn('Proactive refresh failed:', error);
      }
    }

    const response = await api.get<User>('/auth/me/');
    return response.data;
  },
};
