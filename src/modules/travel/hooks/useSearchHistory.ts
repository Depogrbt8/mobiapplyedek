import { useCallback } from 'react';
import { searchHistoryService } from '@/services/searchHistoryService';

/**
 * Hook to save search to history
 */
export const useSearchHistory = () => {
  const saveSearch = useCallback(async (searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'oneWay' | 'roundTrip';
  }) => {
    try {
      await searchHistoryService.addSearch(searchParams);
    } catch (error) {
      // Silently fail - search history is not critical
      console.warn('Failed to save search history:', error);
    }
  }, []);

  return { saveSearch };
};

