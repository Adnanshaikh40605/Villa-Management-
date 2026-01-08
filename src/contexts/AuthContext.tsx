import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authService } from '@/services/auth';
import { handleApiError } from '@/services/api';
import { isTokenExpired, isTokenExpiringSoon } from '@/utils/jwt';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'villa_admin_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session with JWT token
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem(STORAGE_KEY);

      if (!accessToken || !refreshToken) {
        // No tokens found, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem(STORAGE_KEY);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Check if access token is expired or expiring soon
      const accessExpired = isTokenExpired(accessToken);
      const accessExpiringSoon = isTokenExpiringSoon(accessToken, 300); // 5 minutes threshold

      // If access token is expired or expiring soon, try to refresh it
      if (accessExpired || accessExpiringSoon) {
        try {
          const { access } = await authService.refreshToken(refreshToken);
          // Store new access token
          localStorage.setItem('access_token', access);
          
          // Verify new token by fetching user
          const currentUser = await authService.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } catch (refreshError) {
          // Refresh failed, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem(STORAGE_KEY);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
        return;
      }

      // Access token is still valid, verify it by fetching user
      if (storedUser) {
        try {
          const currentUser = await authService.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } catch (error) {
          // Token invalid (maybe blacklisted or user doesn't exist), try refresh
          try {
            const { access } = await authService.refreshToken(refreshToken);
            localStorage.setItem('access_token', access);
            const currentUser = await authService.getCurrentUser();
            setState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
          } catch (refreshError) {
            // Refresh also failed, clear storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem(STORAGE_KEY);
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        // No stored user, fetch it
        try {
          const currentUser = await authService.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } catch (error) {
          // Fetch failed, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem(STORAGE_KEY);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login error:', handleApiError(error));
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(STORAGE_KEY);
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
