import { apiClient } from '@/core/api/client';

export interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  rating: number;
  price: number;
  currency: string;
  image?: string;
  amenities?: string[];
}

export interface HotelSearchQuery {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface HotelSearchResponse {
  success: boolean;
  data: Hotel[];
}

/**
 * Hotel service
 */
export const hotelService = {
  /**
   * Search hotels
   */
  async searchHotels(query: HotelSearchQuery): Promise<Hotel[]> {
    const response = await apiClient.post<HotelSearchResponse>(
      '/api/hotels/search',
      query
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Hotel search failed');
  },

  /**
   * Get hotel details
   */
  async getHotelDetails(hotelId: string): Promise<Hotel> {
    const response = await apiClient.get<{ success: boolean; data: Hotel }>(
      `/api/hotels/${hotelId}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Hotel details not found');
  },
};

