import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authService } from '@/services/auth';
import { handleApiError } from '@/services/api';
import { isTokenExpired } from '@/utils/jwt';

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

      // Check if access token is actually expired (not "expiring soon")
      const accessExpired = isTokenExpired(accessToken);

      if (accessExpired) {
        // Access token is expired, try to refresh
        try {
          const { access, refresh } = await authService.refreshToken(refreshToken);
          localStorage.setItem('access_token', access);
          if (refresh) {
            localStorage.setItem('refresh_token', refresh);
          }
          
          // Token refreshed successfully, now fetch user
          const currentUser = await authService.getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } catch (refreshError) {
          // Refresh failed - only then logout
          console.error('Token refresh failed on page load:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem(STORAGE_KEY);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        // Access token is still valid - trust it without making an API call
        if (storedUser) {
          try {
            setState({
              user: JSON.parse(storedUser),
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (parseError) {
            // Stored user data is corrupted, fetch fresh
            console.warn('Stored user data corrupted, fetching fresh:', parseError);
            try {
              const currentUser = await authService.getCurrentUser();
              setState({
                user: currentUser,
                isAuthenticated: true,
                isLoading: false,
              });
              localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
            } catch (fetchError) {
              // Only logout if it's a 401 (invalid token)
              if (handleApiError(fetchError).includes('401') || handleApiError(fetchError).includes('Unauthorized')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem(STORAGE_KEY);
                setState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              } else {
                // Network error or server error - keep session but mark as loading done
                // User will see an error on the page but won't be logged out
                setState({
                  user: null,
                  isAuthenticated: true, // Keep authenticated state
                  isLoading: false,
                });
              }
            }
          }
        } else {
          // No stored user, fetch it ONCE since token is valid
          try {
            const currentUser = await authService.getCurrentUser();
            setState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
          } catch (fetchError) {
            // Only logout if it's a 401 (invalid token)
            if (handleApiError(fetchError).includes('401') || handleApiError(fetchError).includes('Unauthorized')) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem(STORAGE_KEY);
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            } else {
              // Network error or server error - keep session but mark as loading done
              setState({
                user: null,
                isAuthenticated: true, // Keep authenticated state
                isLoading: false,
              });
            }
          }
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
