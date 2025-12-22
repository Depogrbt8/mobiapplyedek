import { apiClient } from '@/core/api/client';

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  identityNumber: string | null;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: 'male' | 'female';
  countryCode: string;
  phone?: string;
  hasMilCard: boolean;
  isAccountOwner?: boolean;
  isForeigner?: boolean;
}

/**
 * Passenger service
 */
export const passengerService = {
  /**
   * Get all passengers
   */
  async getPassengers(): Promise<Passenger[]> {
    const response = await apiClient.get<Passenger[]>('/passengers');
    return response.data;
  },

  /**
   * Add new passenger
   */
  async addPassenger(data: Partial<Passenger>): Promise<Passenger> {
    const response = await apiClient.post<Passenger>('/passengers', data);
    return response.data;
  },

  /**
   * Update passenger
   */
  async updatePassenger(id: string, data: Partial<Passenger>): Promise<Passenger> {
    const response = await apiClient.put<Passenger>(`/passengers/${id}`, data);
    return response.data;
  },

  /**
   * Delete passenger
   */
  async deletePassenger(id: string): Promise<void> {
    await apiClient.delete(`/passengers/${id}`);
  },
};


