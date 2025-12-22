import * as SecureStore from 'expo-secure-store';

/**
 * Secure Storage wrapper for tokens and sensitive data
 * Uses expo-secure-store for encrypted storage
 */
export const secureStorage = {
  /**
   * Store access and refresh tokens
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('access_token');
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync('refresh_token');
  },

  /**
   * Clear all stored tokens
   */
  async clearAll(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },

  /**
   * Store user data (optional, can use async storage for non-sensitive data)
   */
  async setUserData(userData: string): Promise<void> {
    await SecureStore.setItemAsync('user_data', userData);
  },

  /**
   * Get user data
   */
  async getUserData(): Promise<string | null> {
    return SecureStore.getItemAsync('user_data');
  },
};



