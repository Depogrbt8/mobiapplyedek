import { useEffect } from 'react';
import { searchHistoryService } from '@/services/searchHistoryService';
import { useTravelStore } from '@/modules/travel/store/travelStore';

/**
 * Hook to automatically save search history when flight search is performed
 */
export const useSearchHistory = () => {
  const { flightSearchQuery } = useTravelStore();

  useEffect(() => {
    const saveSearch = async () => {
      if (
        flightSearchQuery.origin &&
        flightSearchQuery.destination &&
        flightSearchQuery.departureDate
      ) {
        try {
          await searchHistoryService.saveSearch({
            origin: flightSearchQuery.origin,
            destination: flightSearchQuery.destination,
            departureDate: flightSearchQuery.departureDate,
            returnDate: flightSearchQuery.returnDate,
            passengers: flightSearchQuery.passengers || 1,
            tripType: flightSearchQuery.tripType || 'oneWay',
          });
        } catch (error) {
          // Silently fail - search history is not critical
          console.error('Failed to save search history:', error);
        }
      }
    };

    saveSearch();
  }, [
    flightSearchQuery.origin,
    flightSearchQuery.destination,
    flightSearchQuery.departureDate,
  ]);
};

