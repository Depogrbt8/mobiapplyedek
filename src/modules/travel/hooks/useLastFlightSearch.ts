import { useState, useEffect } from 'react';
import { searchHistoryService, type SearchHistory } from '@/services/searchHistoryService';
import { flightService } from '../services/flightService';
import type { Flight } from '@/types/flight';

interface LastFlightSearchData {
  search: SearchHistory | null;
  currentPrice: number | null;
  returnPrice: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get last flight search and its current price
 */
export const useLastFlightSearch = () => {
  const [data, setData] = useState<LastFlightSearchData>({
    search: null,
    currentPrice: null,
    returnPrice: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLastSearch = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Get search history
        let history: SearchHistory[];
        let useMockData = false;
        
        try {
          history = await searchHistoryService.getSearchHistory();
        } catch (apiError: any) {
          // Handle 404 or other API errors - use mock data for design
          if (apiError?.status === 404 || apiError?.response?.status === 404) {
            useMockData = true;
          } else {
            throw apiError; // Re-throw if it's not a 404
          }
        }
        
        // Use mock data if API fails or history is empty
        if (useMockData || !history || history.length === 0) {
          // Mock data for design purposes
          const mockSearch: SearchHistory = {
            id: 'mock-1',
            origin: 'BRU',
            destination: 'AYT',
            departureDate: new Date(2025, 11, 20).toISOString().split('T')[0], // 20/12/2025
            returnDate: new Date(2026, 0, 3).toISOString().split('T')[0], // 03/01/2026
            passengers: 1,
            tripType: 'roundTrip',
            createdAt: new Date().toISOString(),
          };

          setData({
            search: mockSearch,
            currentPrice: 120, // Mock price in EUR
            returnPrice: 29, // Mock return price in EUR
            loading: false,
            error: null,
          });
          return;
        }

        // Get the most recent search (first item)
        const lastSearch = history[0];

        // Fetch current price for this search
        try {
          const flights = await flightService.searchFlights({
            origin: lastSearch.origin,
            destination: lastSearch.destination,
            departureDate: lastSearch.departureDate,
            returnDate: lastSearch.returnDate,
            passengers: lastSearch.passengers,
            tripType: lastSearch.tripType,
            directOnly: false,
          });

          // Find the lowest price from all flights
          const prices = flights
            .map(f => f.price)
            .filter(p => p > 0);
          
          const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

          // For round trip, we could fetch return flights separately
          // For now, we'll use the same price or fetch separately if needed
          let lowestReturnPrice = null;
          if (lastSearch.tripType === 'roundTrip' && lastSearch.returnDate) {
            try {
              const returnFlights = await flightService.searchFlights({
                origin: lastSearch.destination,
                destination: lastSearch.origin,
                departureDate: lastSearch.returnDate,
                passengers: lastSearch.passengers,
                tripType: 'oneWay',
                directOnly: false,
              });
              
              const returnPrices = returnFlights
                .map(f => f.price)
                .filter(p => p > 0);
              
              lowestReturnPrice = returnPrices.length > 0 ? Math.min(...returnPrices) : null;
            } catch (returnError) {
              console.warn('Failed to fetch return price:', returnError);
            }
          }

          setData({
            search: lastSearch,
            currentPrice: lowestPrice,
            returnPrice: lowestReturnPrice,
            loading: false,
            error: null,
          });
        } catch (priceError) {
          // If price fetch fails, still show the search but without price
          console.warn('Failed to fetch current price:', priceError);
          setData({
            search: lastSearch,
            currentPrice: null,
            returnPrice: null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        // Only log non-404 errors
        if (error?.status !== 404 && error?.response?.status !== 404) {
          console.error('Failed to fetch last search:', error);
        }
        setData({
          search: null,
          currentPrice: null,
          returnPrice: null,
          loading: false,
          error: null, // Don't show error to user, just hide the card
        });
      }
    };

    fetchLastSearch();
  }, []);

  const refresh = async () => {
    // Re-fetch the data
    let history: SearchHistory[];
    try {
      history = await searchHistoryService.getSearchHistory();
    } catch (apiError: any) {
      if (apiError?.status === 404 || apiError?.response?.status === 404) {
        setData({
          search: null,
          currentPrice: null,
          returnPrice: null,
          loading: false,
          error: null,
        });
        return;
      }
      throw apiError;
    }
    
    if (!history || history.length === 0) {
      setData({
        search: null,
        currentPrice: null,
        returnPrice: null,
        loading: false,
        error: null,
      });
      return;
    }

    const lastSearch = history[0];
    try {
      const flights = await flightService.searchFlights({
        origin: lastSearch.origin,
        destination: lastSearch.destination,
        departureDate: lastSearch.departureDate,
        returnDate: lastSearch.returnDate,
        passengers: lastSearch.passengers,
        tripType: lastSearch.tripType,
        directOnly: false,
      });

      const prices = flights
        .map(f => f.price)
        .filter(p => p > 0);
      
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

      let lowestReturnPrice = null;
      if (lastSearch.tripType === 'roundTrip' && lastSearch.returnDate) {
        try {
          const returnFlights = await flightService.searchFlights({
            origin: lastSearch.destination,
            destination: lastSearch.origin,
            departureDate: lastSearch.returnDate,
            passengers: lastSearch.passengers,
            tripType: 'oneWay',
            directOnly: false,
          });
          
          const returnPrices = returnFlights
            .map(f => f.price)
            .filter(p => p > 0);
          
          lowestReturnPrice = returnPrices.length > 0 ? Math.min(...returnPrices) : null;
        } catch (returnError) {
          console.warn('Failed to fetch return price:', returnError);
        }
      }

      setData({
        search: lastSearch,
        currentPrice: lowestPrice,
        returnPrice: lowestReturnPrice,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      if (error?.status !== 404 && error?.response?.status !== 404) {
        console.warn('Failed to refresh last search:', error);
      }
      setData(prev => ({
        ...prev,
        currentPrice: null,
        returnPrice: null,
        loading: false,
        error: null,
      }));
    }
  };

  return { ...data, refresh };
};







