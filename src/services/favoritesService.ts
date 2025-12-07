import { apiClient } from '@/core/api/client';

export interface FavoriteSearch {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  createdAt: string;
}

interface FavoritesResponse {
  favorites: FavoriteSearch[];
}

/**
 * Favorites service
 */
export const favoritesService = {
  /**
   * Get favorite searches
   */
  async getFavorites(): Promise<FavoriteSearch[]> {
    const response = await apiClient.get<FavoritesResponse>('/api/search-favorites');
    return response.data.favorites;
  },

  /**
   * Add favorite search
   */
  async addFavorite(data: {
    origin: string;
    destination: string;
    departureDate: string;
  }): Promise<FavoriteSearch> {
    const response = await apiClient.post<FavoriteSearch>('/api/search-favorites', data);
    return response.data;
  },

  /**
   * Delete favorite search
   */
  async deleteFavorite(id: string): Promise<void> {
    await apiClient.delete(`/api/search-favorites?id=${id}`);
  },
};
