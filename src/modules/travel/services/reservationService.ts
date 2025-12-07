import { apiClient } from '@/core/api/client';
import type { Flight } from '@/types/flight';

interface CreateFlightReservationRequest {
  type: 'flight';
  flightId: string;
  passenger: any;
  amount: number;
  currency: string;
}

interface CreateHotelReservationRequest {
  type: 'hotel';
  hotelId: string;
  guest: any;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  amount: number;
  currency: string;
}

interface CreateCarReservationRequest {
  type: 'car';
  carId: string;
  renter: any;
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffDate: string;
  dropoffTime: string;
  amount: number;
  currency: string;
}

interface ReservationResponse {
  id: string;
  pnr?: string;
  reservationNo?: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Reservation service
 */
export const reservationService = {
  /**
   * Create flight reservation
   */
  async createFlightReservation(data: CreateFlightReservationRequest): Promise<ReservationResponse> {
    const response = await apiClient.post<ReservationResponse>('/api/reservations', {
      type: data.type,
      flightId: data.flightId,
      passengers: [data.passenger],
      amount: data.amount,
      currency: data.currency,
    });

    return response.data;
  },

  /**
   * Create hotel reservation
   */
  async createHotelReservation(data: CreateHotelReservationRequest): Promise<ReservationResponse> {
    const response = await apiClient.post<ReservationResponse>('/api/reservations', {
      type: data.type,
      hotelId: data.hotelId,
      guest: data.guest,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      rooms: data.rooms,
      amount: data.amount,
      currency: data.currency,
    });

    return response.data;
  },

  /**
   * Create car reservation
   */
  async createCarReservation(data: CreateCarReservationRequest): Promise<ReservationResponse> {
    const response = await apiClient.post<ReservationResponse>('/api/reservations', {
      type: data.type,
      carId: data.carId,
      renter: data.renter,
      pickupLocation: data.pickupLocation,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      dropoffLocation: data.dropoffLocation,
      dropoffDate: data.dropoffDate,
      dropoffTime: data.dropoffTime,
      amount: data.amount,
      currency: data.currency,
    });

    return response.data;
  },

  /**
   * Get user reservations
   */
  async getReservations(type?: 'flight' | 'hotel' | 'car'): Promise<any[]> {
    const url = type ? `/api/reservations?type=${type}` : '/api/reservations';
    const response = await apiClient.get<any[]>(url);
    return response.data;
  },

  /**
   * Get reservation details
   */
  async getReservationDetails(reservationId: string): Promise<any> {
    const response = await apiClient.get(`/api/reservations/${reservationId}`);
    return response.data;
  },
};

