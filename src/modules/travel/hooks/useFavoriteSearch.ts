import { useCallback } from 'react';
import { favoritesService } from '@/services/favoritesService';

/**
 * Hook to add search to favorites
 */
export const useFavoriteSearch = () => {
  const addToFavorites = useCallback(async (searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
  }) => {
    try {
      await favoritesService.addFavorite(searchParams);
    } catch (error) {
      // Silently fail - favorites are not critical
      console.warn('Failed to add to favorites:', error);
    }
  }, []);

  return { addToFavorites };
};



