import { apiClient } from '@/core/api/client';

export interface SearchHistory {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
  createdAt: string;
}

/**
 * Search History service
 */
export const searchHistoryService = {
  /**
   * Get search history
   */
  async getSearchHistory(): Promise<SearchHistory[]> {
    const response = await apiClient.get<SearchHistory[]>('/api/search-history');
    return response.data;
  },

  /**
   * Add search to history
   */
  async addSearch(data: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'oneWay' | 'roundTrip';
  }): Promise<SearchHistory> {
    const response = await apiClient.post<SearchHistory>('/api/search-history', data);
    return response.data;
  },

  /**
   * Clear search history
   */
  async clearHistory(): Promise<void> {
    await apiClient.delete('/api/search-history');
  },
};
