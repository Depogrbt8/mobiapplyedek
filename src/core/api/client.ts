import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../storage/secureStore';
import { config } from '@/constants/config';

/**
 * API Client with interceptors
 * Handles authentication, error handling, and token refresh
 */
export const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: config.timeouts.api,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: Token gönderiliyor mu kontrol et
      console.log('🔑 Token gönderiliyor:', config.url, token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Token bulunamadı:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) {
          // No refresh token, clear all and redirect to login
          await secureStorage.clearAll();
          throw new Error('No refresh token available');
        }

        // config.API_URL already includes '/api', so we only need '/auth/refresh'
        const response = await axios.post(
          `${config.API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await secureStorage.setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await secureStorage.clearAll();
        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401,
          code: 'SESSION_EXPIRED',
        });
      }
    }

    // Standardize error format
    const errorMessage =
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      'Bir hata oluştu';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: (error.response?.data as any)?.errorCode,
      data: error.response?.data,
    });
  }
);


