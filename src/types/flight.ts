export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface Flight {
  id: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  direct: boolean;
  baggage: string;
}

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
  directOnly: boolean;
} 