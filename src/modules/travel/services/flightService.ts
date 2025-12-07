import { apiClient } from '@/core/api/client';
import type { Flight, FlightSearchQuery, Airport } from '@/types/flight';

interface FlightSearchResponse {
  success: boolean;
  data: Flight[];
  cached?: boolean;
  cacheKey?: string;
  ttl?: number;
}

interface AirportSearchResponse {
  success: boolean;
  data: Airport[];
}

/**
 * Flight service for API calls
 */
export const flightService = {
  /**
   * Search flights
   */
  async searchFlights(query: FlightSearchQuery): Promise<Flight[]> {
    const response = await apiClient.post<FlightSearchResponse>(
      '/api/flights/search-cached',
      {
        from: query.origin,
        to: query.destination,
        departureDate: query.departureDate,
        returnDate: query.returnDate,
        passengers: query.passengers,
        tripType: query.tripType,
        directOnly: query.directOnly,
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Flight search failed');
  },

  /**
   * Search airports
   */
  async searchAirports(query: string): Promise<Airport[]> {
    const response = await apiClient.get<AirportSearchResponse>(
      `/api/airports/search?q=${encodeURIComponent(query)}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    return [];
  },

  /**
   * Get flight details
   */
  async getFlightDetails(flightId: string): Promise<Flight> {
    const response = await apiClient.get<{ success: boolean; data: Flight }>(
      `/api/flights/${flightId}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Flight details not found');
  },
};

