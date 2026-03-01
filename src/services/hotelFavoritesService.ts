import { apiClient } from '@/core/api/client';

export interface HotelFavorite {
  id: string;
  hotelId: string;
  hotelName: string | null;
  hotelLocation: string | null;
  hotelImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetFavoriteStatusResponse {
  isFavorite: boolean;
  favorite: HotelFavorite | null;
}

interface GetFavoritesListResponse {
  favorites: HotelFavorite[];
  hotelIds: string[];
}

/**
 * Otel favorileri servisi - ana site /api/hotel-favorites ile uyumlu
 */
export const hotelFavoritesService = {
  /**
   * Belirli bir otelin favori olup olmadığını kontrol et
   */
  async checkFavorite(hotelId: string): Promise<boolean> {
    const response = await apiClient.get<GetFavoriteStatusResponse>('/hotel-favorites', {
      params: { hotelId },
    });
    return response.data.isFavorite ?? false;
  },

  /**
   * Oteli favorilere ekle
   */
  async addFavorite(data: {
    hotelId: string;
    hotelName?: string;
    hotelLocation?: string;
    hotelImage?: string;
  }): Promise<void> {
    await apiClient.post('/hotel-favorites', {
      hotelId: data.hotelId,
      hotelName: data.hotelName,
      hotelLocation: data.hotelLocation,
      hotelImage: data.hotelImage,
    });
  },

  /**
   * Oteli favorilerden çıkar
   */
  async removeFavorite(hotelId: string): Promise<void> {
    await apiClient.delete('/hotel-favorites', {
      params: { hotelId },
    });
  },

  /**
   * Kullanıcının tüm favori otellerini getir
   */
  async getFavorites(): Promise<HotelFavorite[]> {
    const response = await apiClient.get<GetFavoritesListResponse>('/hotel-favorites');
    return response.data.favorites ?? [];
  },
};
