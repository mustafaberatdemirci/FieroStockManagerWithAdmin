import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'STORE';
  storeName?: string;
  storeId?: string;
  store?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenValue = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');

      if (token && refreshTokenValue && savedUser) {
        try {
          // First restore user from localStorage
          const userInfo = JSON.parse(savedUser);
          setUser(userInfo);

          // Then try to refresh token in background
          try {
            const response = await api.post('/auth/refresh', {
              refreshToken: refreshTokenValue
            });

            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data.data;

              // Update tokens
              localStorage.setItem('token', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              const updatedUserInfo = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                storeName: userData.store?.name,
                storeId: userData.store?.id,
                store: userData.store
              };

              localStorage.setItem('user', JSON.stringify(updatedUserInfo));
              setUser(updatedUserInfo);
            } else {
              // If refresh fails, clear auth data
              clearAuthData();
            }
          } catch (refreshError) {
            console.error('Token refresh failed during initialization:', refreshError);
            clearAuthData();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          clearAuthData();
        }
      } else {
        clearAuthData();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { accessToken, refreshToken: refreshTokenValue, user: userData } = response.data.data;

        // Store tokens and user data
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshTokenValue);

        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          storeName: userData.store?.name,
          storeId: userData.store?.id,
          store: userData.store
        };

        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: unknown) {
      let errorMessage = 'Invalid credentials';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || 'Invalid credentials';
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (refreshTokenValue) {
        // Call logout endpoint to invalidate refresh token
        await api.post('/auth/logout', { refreshToken: refreshTokenValue });
      }
    } catch (error) {
      // Silently ignore logout errors
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (!refreshTokenValue) {
        return false;
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshTokenValue
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data.data;

        // Update tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          storeName: userData.store?.name,
          storeId: userData.store?.id,
          store: userData.store
        };

        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        refreshToken,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
