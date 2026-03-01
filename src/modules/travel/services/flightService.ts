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
    // Demo/Mock uçuş verileri (desktop/grbt8'deki gibi)
    const generateDemoFlights = (origin: string, destination: string, departureDate: string): Flight[] => {
      const baseDate = departureDate || new Date().toISOString().split('T')[0];
      
      return [
        {
          id: '1',
          airlineName: 'Turkish Airlines',
          flightNumber: 'TK123',
          origin: origin,
          destination: destination,
          departureTime: `${baseDate}T09:00:00`,
          arrivalTime: `${baseDate}T10:20:00`,
          duration: '1h 20m',
          price: 120,
          currency: 'EUR',
          direct: true,
          baggage: '15 kg',
        },
        {
          id: '2',
          airlineName: 'SunExpress',
          flightNumber: 'XQ456',
          origin: origin,
          destination: destination,
          departureTime: `${baseDate}T13:30:00`,
          arrivalTime: `${baseDate}T15:00:00`,
          duration: '1h 30m',
          price: 99,
          currency: 'EUR',
          direct: false,
          baggage: '20 kg',
        },
        {
          id: '3',
          airlineName: 'Pegasus',
          flightNumber: 'PC789',
          origin: origin,
          destination: destination,
          departureTime: `${baseDate}T18:00:00`,
          arrivalTime: `${baseDate}T19:10:00`,
          duration: '1h 10m',
          price: 105,
          currency: 'EUR',
          direct: true,
          baggage: '10 kg',
        },
        {
          id: '4',
          airlineName: 'AnadoluJet',
          flightNumber: 'TK4567',
          origin: origin,
          destination: destination,
          departureTime: `${baseDate}T07:00:00`,
          arrivalTime: `${baseDate}T08:15:00`,
          duration: '1h 15m',
          price: 89,
          currency: 'EUR',
          direct: true,
          baggage: '15 kg',
        },
        {
          id: '5',
          airlineName: 'Airjet',
          flightNumber: 'AJ789',
          origin: origin,
          destination: destination,
          departureTime: `${baseDate}T21:00:00`,
          arrivalTime: `${baseDate}T22:30:00`,
          duration: '1h 30m',
          price: 115,
          currency: 'EUR',
          direct: false,
          baggage: '20 kg',
        },
      ];
    };

    try {
      // Önce API'ye istek atmayı dene
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

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        return response.data.data;
      }

      // API başarısız veya veri yoksa mock data döndür
      return generateDemoFlights(query.origin, query.destination, query.departureDate);
    } catch (error) {
      // Hata durumunda mock data döndür (sistem kurulumu için)
      return generateDemoFlights(query.origin, query.destination, query.departureDate);
    }
  },

  /**
   * Search airports
   */
  async searchAirports(query: string): Promise<Airport[]> {
    // Demo havaalanı listesi (fallback)
    const demoAirports: Airport[] = [
      { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
      { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
      { code: 'ESB', name: 'Esenboğa Havalimanı', city: 'Ankara' },
      { code: 'ADB', name: 'Adnan Menderes Havalimanı', city: 'İzmir' },
      { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya' },
      { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
      { code: 'FRA', name: 'Frankfurt Havalimanı', city: 'Frankfurt' },
      { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
      { code: 'LHR', name: 'Heathrow', city: 'Londra' },
      { code: 'BRU', name: 'Brussels Airport', city: 'Brüksel' },
      { code: 'ZRH', name: 'Zürich Airport', city: 'Zürih' },
      { code: 'VIE', name: 'Vienna International', city: 'Viyana' },
    ];

    try {
      const response = await apiClient.get<AirportSearchResponse>(
        `/api/airports/search?q=${encodeURIComponent(query)}`
      );

      if (response.data.success && response.data.data.length > 0) {
        return response.data.data;
      }

      // API başarısız olursa veya veri yoksa demo verileri filtrele
      const q = query.toLowerCase();
      return demoAirports.filter(airport =>
        airport.code.toLowerCase().includes(q) ||
        airport.name.toLowerCase().includes(q) ||
        airport.city.toLowerCase().includes(q)
      );
    } catch (error) {
      // Hata durumunda demo verileri filtrele
      const q = query.toLowerCase();
      return demoAirports.filter(airport =>
        airport.code.toLowerCase().includes(q) ||
        airport.name.toLowerCase().includes(q) ||
        airport.city.toLowerCase().includes(q)
      );
    }
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






