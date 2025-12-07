/**
 * Authentication types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  gender?: string;
  identityNumber?: string;
  isForeigner?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

