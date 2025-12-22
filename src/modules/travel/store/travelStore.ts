import { create } from 'zustand';
import type { Flight, FlightSearchQuery, Airport } from '@/types/flight';

interface FlightSearchState {
  searchQuery: FlightSearchQuery | null;
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  selectedFlight: Flight | null;
  
  // Actions
  setSearchQuery: (query: FlightSearchQuery) => void;
  setFlights: (flights: Flight[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  clearSearch: () => void;
}

export const useTravelStore = create<FlightSearchState>((set) => ({
  searchQuery: null,
  flights: [],
  isLoading: false,
  error: null,
  selectedFlight: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFlights: (flights) => set({ flights, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  clearSearch: () => set({
    searchQuery: null,
    flights: [],
    error: null,
    selectedFlight: null,
  }),
}));



