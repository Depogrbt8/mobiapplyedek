import { apiClient } from '../api/client';
import { secureStorage } from '../storage/secureStore';
import type { LoginCredentials, LoginResponse, RefreshTokenResponse, RegisterData, User } from './types';

/**
 * Authentication service
 * Handles login, register, logout, and token management
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/mobile-login', credentials);
    
    if (response.data.success) {
      // Store tokens
      await secureStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
      // Store user data
      await secureStorage.setUserData(JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = await secureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refreshToken,
    });

    if (response.data.success) {
      await secureStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
    }

    return response.data;
  },

  /**
   * Get current user from stored data
   */
  async getCurrentUser(): Promise<User | null> {
    const userData = await secureStorage.getUserData();
    if (!userData) return null;
    return JSON.parse(userData) as User;
  },

  /**
   * Logout - clear all stored data
   */
  async logout(): Promise<void> {
    await secureStorage.clearAll();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await secureStorage.getAccessToken();
    return !!token;
  },
};

