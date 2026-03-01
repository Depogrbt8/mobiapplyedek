import { apiClient } from '@/core/api/client';
import type { User } from '@/core/auth/types';

export interface UserProfile extends User {
  customerNo?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phone?: string;
  birthDay?: string | number;
  birthMonth?: string | number;
  birthYear?: string | number;
  gender?: string;
  identityNumber?: string;
  isForeigner?: boolean;
  address?: string;
  city?: string;
}

/**
 * User service
 * Handles user profile operations
 */
export const userService = {
  /**
   * Get current user profile from backend
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/user/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/user/update', data);
    return response.data;
  },
};










