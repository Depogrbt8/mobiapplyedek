import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hotelFavoritesService } from '@/services/hotelFavoritesService';

export interface UseHotelFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  toggleFavorite: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * Otel favori durumu ve toggle - ana site useHotelFavorite ile aynı mantık.
 * Giriş yoksa favori eklenmez, error ile "giriş yapmalısınız" mesajı döner.
 */
export function useHotelFavorite(
  hotelId: string,
  hotelInfo?: { name?: string; location?: string; image?: string }
): UseHotelFavoriteReturn {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFavoriteStatus = useCallback(async () => {
    if (!hotelId) return;
    try {
      const favorite = await hotelFavoritesService.checkFavorite(hotelId);
      setIsFavorite(favorite);
    } catch {
      setIsFavorite(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (isAuthenticated && hotelId) {
      checkFavoriteStatus();
    } else {
      setIsFavorite(false);
    }
  }, [isAuthenticated, hotelId, checkFavoriteStatus]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (isFavorite) {
        await hotelFavoritesService.removeFavorite(hotelId);
        setIsFavorite(false);
      } else {
        await hotelFavoritesService.addFavorite({
          hotelId,
          hotelName: hotelInfo?.name,
          hotelLocation: hotelInfo?.location,
          hotelImage: hotelInfo?.image,
        });
        setIsFavorite(true);
      }
    } catch (err: any) {
      const message = err?.message || (isFavorite ? 'Favorilerden çıkarma hatası' : 'Favorilere ekleme hatası');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, hotelId, isFavorite, hotelInfo?.name, hotelInfo?.location, hotelInfo?.image]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
    error,
    clearError,
  };
}
