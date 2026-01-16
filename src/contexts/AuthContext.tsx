import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authService } from '@/services/auth';
import { handleApiError } from '@/services/api';


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

      // No tokens found, clear everything and set unauthenticated
      if (!accessToken || !refreshToken) {
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

      // Optimistically trust stored credentials
      // If the access token is expired, the api.ts interceptor will handle the refresh
      // automatically upon the first API request.
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // If parsing fails, try to verify with backend
          try {
            const currentUser = await authService.getCurrentUser();
            setState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
          } catch (fetchError) {
            // If fetch fails (and refresh fails), clear everything
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
         // Tokens exist but no user data? Fetch it.
         try {
            const currentUser = await authService.getCurrentUser();
            setState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
         } catch (fetchError) {
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
