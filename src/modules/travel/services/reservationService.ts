import { apiClient } from '@/core/api/client';

interface CreateFlightReservationRequest {
  type: 'flight';
  flightId: string;
  passenger?: any; // Deprecated, use passengers instead
  passengers?: any[];
  contactInfo?: {
    email: string;
    phone: string;
    countryCode: string;
  };
  baggageSelections?: any[];
  bookingType?: 'reserve' | 'book';
  marketingConsent?: boolean;
  amount: number;
  currency: string;
}

// NOT: Otel rezervasyonları artık hotelBookingService üzerinden
// POST /api/hotels/bookings ile yapılıyor (desktop ile aynı).
// Bu dosyadaki createHotelReservation fonksiyonu backward compatibility için kalıyor.

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
  async createFlightReservation(data: CreateFlightReservationRequest): Promise<ReservationResponse & { pnr?: string; validUntil?: string }> {
    const response = await apiClient.post<ReservationResponse & { pnr?: string; validUntil?: string }>('/api/reservations', {
      type: data.type,
      flightId: data.flightId,
      passengers: data.passengers || (data.passenger ? [data.passenger] : []),
      contactInfo: data.contactInfo,
      baggageSelections: data.baggageSelections,
      bookingType: data.bookingType || 'book',
      marketingConsent: data.marketingConsent,
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

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/reservations/${reservationId}`);
    return response.data;
  },
};

